import clone from 'clone';
import Resource from './Resource/Resource';
import type from './Schema/type';

export default class FieldResolver {

	static OPTION_DEFAULTS =  {
		isList: false,
		resolver: values => values.length ? values[values.length - 1] : undefined
	};

	constructor({resources, context}) {
		this.resources = resources.map(resource => new Resource(resource));
		this.context = context;
	}

	resolveAll({fields}) {
		const promises = [];

		for(const [name, options] of Object.entries(fields)) {
			const promise = this.resolve({name, options});

			if(promise instanceof Promise) {
				promises.push(promise);
			}
		}

		if(promises.length) {
			return Promise.all(promises);
		}
	}

	resolve({name, options = {}}) {
		options = Object.assign({}, this.constructor.OPTION_DEFAULTS, options);

		let possibleValues = this._resolveAllPossibleValues({
			name,
			options
		});

		if(possibleValues instanceof Promise) {
			return possibleValues.then(possibleValues => this._resolveFinalValue({name, options, possibleValues}));
		}

		return this._resolveFinalValue({name, options, possibleValues});
	}

	_resolveFinalValue({name, options, possibleValues}) {
		const finalValue = options.resolver(possibleValues);
		this.context.getSchemaSnapshot().extract({path: this.context.getCurrentPath()}).setField({
			name,
			value: clone(finalValue)
		});
	}

	_resolveAllPossibleValues({name, options}) {
		let schema = this.context.getCurrentSchema();

		if(type(schema) === 'function') {
			return [];
		}

		schema = schema.getInnerSchema();

		let resolved = this._resolveHardcodedSchemaValue({
			options,
			schema: schema[name]
		});

		resolved = this._resolveMatchingResources({
			name,
			options,
			resolved,
			schema: schema[name]
		});

		if(resolved instanceof Promise) {
			resolved.then(resolved => this._resolveFunctions({options, partiallyResolvedFields: resolved}));
		}

		return this._resolveFunctions({options, partiallyResolvedFields: resolved});
	}

	_resolveHardcodedSchemaValue({options, schema}) {
		if(options.isList && type(schema) === 'array') {
			schema = schema.filter(entry => !Resource.hasExternalFlag({fieldSchema: entry}));
		}

		return this._mergeResolve({
			options,
			value: Resource.hasExternalFlag({fieldSchema: schema}) ? undefined : schema
		});
	}

	_resolveMatchingResources({name, options, schema, resolved = []}) {
		let promises = [];

		for(const resource of this.resources) {
			resolved = this._mergeResolve({
				options,
				resolved,
				promises,
				value: resource.match({
					options,
					fieldName: name,
					fieldSchema: schema,
					context: this.context
				})
			});
		}

		if(promises.length) {
			return Promise.all(promises).then(promiseValues => this._resolvePromises({
				options,
				promises,
				partiallyResolvedFields: resolved,
				resolvedPromiseValues: promiseValues
			}));
		}

		return resolved;
	}

	_resolveFunctions({options, partiallyResolvedFields}) {
		let resolved = [], promises = [];

		for(const partiallyResolvedField of partiallyResolvedFields) {
			if(type(partiallyResolvedField) === 'function') {
				resolved = this._mergeResolve({
					options,
					resolved,
					promises,
					value: partiallyResolvedField(this.context)
				});
			}
			else {
				resolved.push(partiallyResolvedField);
			}
		}

		if(promises.length) {
			return Promise.all(promises).then(promiseValues => this._resolvePromises({
				options,
				promises,
				partiallyResolvedFields: resolved,
				resolvedPromiseValues: promiseValues
			}));
		}

		return resolved;
	}

	_resolvePromises({options, promises, partiallyResolvedFields, resolvedPromiseValues}) {
		let resolved = [];

		for(const partiallyResolvedField of partiallyResolvedFields) {
			if(partiallyResolvedField instanceof Promise) {
				resolved = this._mergeResolve({
					options,
					resolved,
					value: resolvedPromiseValues[promises.indexOf(partiallyResolvedField)]
				});
			}
			else {
				resolved.push(partiallyResolvedField);
			}
		}

		return resolved;
	}

	_resolveUndefinedValues({resolved}) {
		return resolved.map(entry => type(entry) !== 'undefined');
	}

	_mergeResolve({options, value, resolved = [], promises = []}) {
		const valueType = type(value);

		if(value instanceof Promise) {
			promises.push(value);
		}
		else if(options.isList) {
			if(!['array', 'function', 'undefined'].includes(valueType)) {
				console.warn(`Unexpected value type: "${valueType}". Value must be either an array, function or undefined.`, {
					value,
					context: this.context
				});
				return resolved;
			}

			if(valueType === 'undefined') {
				return resolved;
			}

			if(valueType === 'array') {
				return [
					...resolved,
					...value
				];
			}
		}
		else if(valueType === 'undefined') {
			return resolved;
		}

		resolved.push(value);

		return resolved;
	}
}