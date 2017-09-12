import extend from 'extend';
import SchemaSnapshot from './SchemaSnapshot';
import SchemaStore from '../Store/SchemaStore';
import ProcessorStore from '../Store/ProcessorStore';
import Context from '../Context';
import type from './type';
import FlexSchemaError from '../Error';

import {
	preprocessSchemaDefault,
	preprocessSchemaIf,
	preprocessSchemaProcess,
	preprocessSchemaOptional,
	preprocessSchemaNullable,
	preprocessSchemaProcessors,
	preprocessSchemaValidators,
	preprocessSchemaOneOf,
	preprocessSchemaMetadata
} from './schemaPreprocessors';

import {
	validateInitArgs,
	validateInitIndividualArgs,
	validateInitSchemaArg
} from './init';

import {
	validateOneOf
} from './validators'

export default class Schema {

	static types = {};

	static builtinDataTypes = [
		'object',
		'array',
		'string',
		'number',
		'boolean'
	];

	static fields = {
		'type': {},
		'metadata': {
			resolver: metadataList => extend(true, {}, ...metadataList)
		},
		'if': {
			resolver: values => values
		},
		'default': {},
		'oneOf': {
			isList: true,
			resolver: values => values
		},
		'process': {
			resolver: values => values.every(value => value)
		},
		'optional': {
			resolver: values => values.every(value => value)
		},
		'nullable': {
			resolver: values => values.every(value => value)
		},
		'preprocessors': {
			isList: true,
			resolver: values => values
		},
		'postprocessors': {
			isList: true,
			resolver: values => values
		},
		'prevalidators': {
			isList: true,
			resolver: values => values
		},
		'postvalidators': {
			isList: true,
			resolver: values => values
		}
	};

	static customProcessors = [];

	static customValidators = [];

	static schemaStore = new SchemaStore();
	static processorStore = new ProcessorStore();

	schema;

	// Private constructor (only use static init method)
	constructor({schema, resources = []}) {
		this.schema = this._preprocessSchema({schema});
		this.resources = resources;
		this.resolved = {};
	}

	process(options, context = null) {
		context = this._getContext({options, context});

		if(context instanceof Promise) {
			return context.then(context => this._processContextFields(context));
		}

		return this._processContextFields(context);
	}

	validate(options, context = null) {
		if(!options) {
			options = {};
		}

		const {data, resources = [], ...extraOptions} = options;

		if(!context) {
			context = new Context({
				data,
				schema: this,
				processedData: data,
				resources: [
					...this.resources,
					...resources
				],
				options: {
					...extraOptions,
					validate: true
				}
			});
		}

		return this._processContextFields(context, true);
	}

	assert(...args) {
		const context = this.validate(...args);

		if(context instanceof Promise) {
			return context.then(context => this._throwAssetErrors(context))
		}

		return this._throwAssetErrors(context);
	}

	ifCondition(context) {
		const
			ifConditions = context.getField({name: 'if'}),
			promises = [];

		for(const ifCondition of ifConditions) {
			const condition = ifCondition(context);

			if(condition instanceof Promise) {
				promises.push(condition);
				continue;
			}

			if(!condition) {
				return false;
			}
		}

		if(promises.length) {
			return promises.then(conditions => conditions.every(condition => condition));
		}

		return true;
	}

	execPreprocessors(context) {
		return this.execActionField({context, name: 'preprocessors', type: 'processor'});
	}

	execPostprocessors(context) {
		return this.execActionField({context, name: 'postprocessors', type: 'processor'});
	}

	execPrevalidators(context) {
		return this.execActionField({context, name: 'prevalidators', type: 'validator'});
	}

	execPostvalidators(context) {
		return this.execActionField({context, name: 'postvalidators', type: 'validator'});
	}

	execActionField({context, name, type: actionType}) {
		const actions = context.getField({name, options: {isList: true, resolver: values => values}});

		if(actions instanceof Promise) {
			actions.then(actions => this._execActionFieldList({context, actions, actionType}));
		}

		return this._execActionFieldList({context, actions, actionType});
	}

	getEmpty() {
		return;
	}

	getType() {
		return this.schema.type;
	}

	getInnerSchema() {
		return this.schema;
	}

	_getContext({options, context}) {
		if(!options) {
			options = {};
		}

		const {data, resources = [], ...extraOptions} = options;

		if(!context) {
			let empty = this.getEmpty();

			if(empty instanceof Promise) {
				return empty.then(empty => this._generateContext({empty, data, resources, extraOptions}));
			}

			return this._generateContext({empty, data, resources, extraOptions});
		}

		return context;
	}

	_generateContext({empty, data, resources, extraOptions}) {
		return new Context({
			data,
			schema: this,
			processedData: empty,
			resources: [
				...this.resources,
				...resources
			],
			options: extraOptions
		});
	}

	_processContextFields(context, onlyValidate = false) {
		const promise = context.processAllFields({fields: this.constructor.fields});

		if(promise instanceof Promise) {
			if(onlyValidate) {
				return this._runGenericValidator(context, onlyValidate);
			}

			return promise.then(() => this._shouldRunProcessor(context));
		}

		if(onlyValidate) {
			return this._runGenericValidator(context, onlyValidate);
		}

		return this._shouldRunProcessor(context);
	}

	_shouldRunProcessor(context) {
		const condition = this.ifCondition(context);

		if(condition instanceof Promise) {
			return condition.then(condition => {
				if(!condition) {
					return undefined;
				}

				return this._runProcessor(context);
			});
		}

		if(!condition) {
			return undefined;
		}

		return this._runProcessor(context);
	}

	_runProcessor(context) {
		let promise;
		if((promise = this._handleBadOrMissingData(context)) instanceof Promise) {
			return promise.then(() => this._runGenericValidator(context));
		}
		return this._runGenericValidator(context);
	}

	_handleBadOrMissingData(context) {
		if(this._isBuiltInData(context)) {
			if(!this._isNativeInputDataValid(context)) {
				const defaultValue = context.getField({name: 'default'});
				const oneOf = context.getField({name: 'oneOf'});

				if(defaultValue !== undefined) {
					context.setData({data: defaultValue});
				}
				else if(Array.isArray(oneOf) && oneOf.length) {
					context.setData({data: oneOf[0]});
				}
				else {
					const data = context.getCurrentSchema().getEmpty(context);

					if(data instanceof Promise) {
						return data.then(data => context.setData({data}));
					}

					context.setData({data});
				}
			}
		}
		else if(context.getData() === undefined) {
			const
				originalValue = context.getOriginalData(),
				defaultValue = context.getField({name: 'default'});

			context.setData({data: originalValue !== undefined ? originalValue : defaultValue});
		}
	}

	_runGenericValidator(context, onlyValidate = false) {
		const shouldValidate = context.shouldValidate();

		if(shouldValidate) {
			const result = this._execGenericValidator(context);

			if(result instanceof Promise) {
				return result.then(result => {
					if(result !== undefined) {
						return context;
					}

					return this._runPrevalidators(shouldValidate, context, onlyValidate);
				});
			}

			if(result !== undefined) {
				return context;
			}
		}

		return this._runPrevalidators(shouldValidate, context, onlyValidate);
	}

	_runPrevalidators(shouldValidate, context, onlyValidate = false) {
		if(shouldValidate) {
			let promise = this.execPrevalidators(context);

			if(promise instanceof Promise) {
				return promise.then(() => {
					if(onlyValidate) {
						return this._runValidateData(shouldValidate, context, onlyValidate);
					}

					return this._runPreprocessors(shouldValidate, context);
				});
			}
		}

		if(onlyValidate) {
			return this._runValidateData(shouldValidate, context, onlyValidate);
		}

		return this._runPreprocessors(shouldValidate, context);
	}

	_runPreprocessors(shouldValidate, context) {
		let promise = this.execPreprocessors(context);

		if(promise instanceof Promise) {
			return promise.then(() => this._runProcessData(shouldValidate, context))
		}

		return this._runProcessData(shouldValidate, context);
	}

	_runProcessData(shouldValidate, context) {
		if(context.getField({name: 'process'})) {
			let promise = this._processData(context);

			if(promise instanceof Promise) {
				return promise.then(() => this._runValidateData(shouldValidate, context))
			}
		}

		return this._runValidateData(shouldValidate, context);
	}

	_runValidateData(shouldValidate, context, onlyValidate) {
		if(shouldValidate) {
			let promise = this._validateData(context, {
				validateChildren: onlyValidate
			});

			if(promise instanceof Promise) {
				return promise.then(() => {
					if(onlyValidate) {
						return this._runPostvalidators(shouldValidate, context);
					}

					return this._runPostprocessors(shouldValidate, context);
				});
			}
		}

		if(onlyValidate) {
			return this._runPostvalidators(shouldValidate, context);
		}

		return this._runPostprocessors(shouldValidate, context);
	}

	_runPostprocessors(shouldValidate, context) {
		let promise = this.execPostprocessors(context);

		if(promise instanceof Promise) {
			return promise.then(() => this._runPostvalidators(shouldValidate, context))
		}

		return this._runPostvalidators(shouldValidate, context);
	}

	_runPostvalidators(shouldValidate, context) {
		if(shouldValidate) {
			let promise = this.execPostvalidators(context);

			if(promise instanceof Promise) {
				return promise.then(() => context)
			}
		}

		return context;
	}

	_execActionFieldList({context, actions, actionType, index = 0}) {
		if(!actions.length) {
			return;
		}

		while(index < actions.length) {
			const
				action = actions[index],
				result = this._realExecActionField({context, action, actionType});

			index++;

			if(result instanceof Promise) {
				return result.then(() => this._execActionFieldList({context, actions, actionType, index}))
			}
		}
	}

	_realExecActionField({context, action, actionType}) {
		if(type(action) === 'function') {
			return action(context);
		}
		else if(type(this[action]) === 'function') {
			if(actionType === 'processor') {
				if(this.constructor.customProcessors.includes(action)) {
					return this[action].call(this, context);
				}
				else {
					console.warn(`Custom processor "${action}" is not registered with the type class.`, {action});
				}
			}
			else if(actionType === 'validator') {
				if(this.constructor.customValidators.includes(action)) {
					return this[action].call(this, context);
				}
				else {
					console.warn(`Custom validator "${action}" is not registered with the type class.`, {action});
				}
			}
			else {
				console.warn(`Custom action "${action}" has to be either a processor or a validator, not ${actionType}`, {action, actionType});
			}
		}
		else {
			console.warn(`Custom validator or processor "${action}" is neither a function or a method on the type class`, {action});
		}
	};

	_execGenericValidator(context) {
		const result = this._validateInitialDataDefinitionStatus(context);

		if(result instanceof Promise) {
			result.then(result => {
				if(result !== undefined) {
					return result;
				}

				return this._runInitialValidators(context);
			});
		}

		if(result !== undefined) {
			return result;
		}

		return this._runInitialValidators(context);
	}

	_validateInitialDataDefinitionStatus(context) {
		const
			ifCondition = this.ifCondition(context),
			data = context.getData();

		if(ifCondition instanceof Promise) {
			return ifCondition.then(ifCondition => this._validateIfConditionWithData({ifCondition, data, context}));
		}

		return this._validateIfConditionWithData({ifCondition, data, context});
	}

	_validateIfConditionWithData({ifCondition, data, context}) {
		if(!ifCondition && data !== undefined) {
			context.addError({
				type: 'if',
				message: 'Value must be undefined if field "if" is set to false'
			});
			return false
		}

		if(!ifCondition && data === undefined) {
			return true;
		}
	}

	_runInitialValidators(context) {
		const data = context.getData();

		if(context.getField({name: 'optional'}) && data === undefined) {
			return true;
		}

		if(context.getField({name: 'nullable'}) && data === null) {
			return true;
		}

		if(this._isBuiltInData(context) && !this._isNativeInputDataValid(context)) {
			context.addError({
				type: 'type',
				message: `Value must be of type "${this.getType()}".`
			});
			return false;
		}

		validateOneOf({oneOf: context.getField({name: 'oneOf'}), data, context});
	}

	_isBuiltInData(context) {
		return this.constructor.builtinDataTypes.includes(this.getType(context));
	}

	_isNativeInputDataValid(context) {
		return type(context.getData()) === this.getType(context);
	}

	_processData(context) {
		const
			dataType = this.getType(context),
			originalData = context.getOriginalData();

		if(this.constructor.builtinDataTypes.includes(dataType) && type(originalData) === dataType) {
			context.setData({data: originalData});
		}
	}

	_validateData(context, options = {}) {}

	_throwAssetErrors(context) {
		const errors = context.getErrors();

		if(errors.length) {
			throw new FlexSchemaError({
				message: `Data is invalid`,
				code: FlexSchemaError.CODES.BAD_DATA,
				details: {
					context: context.serialize({include: ['errors']})
				}
			});
		}

		return context;
	}

	_preprocessSchema({schema}) {
		schema = extend(true, {}, schema);
		preprocessSchemaIf({schema});
		preprocessSchemaDefault({schema, builtinDataTypes: this.constructor.builtinDataTypes});
		preprocessSchemaProcess({schema});
		preprocessSchemaOptional({schema});
		preprocessSchemaNullable({schema});
		preprocessSchemaProcessors({schema});
		preprocessSchemaValidators({schema});
		preprocessSchemaOneOf({schema});
		preprocessSchemaMetadata({schema});
		return this._preprocessSchemaType({schema});
	}

	_preprocessSchemaType({schema}) {
		return schema;
	}

	static getSchemaStore() {
		return this.schemaStore;
	}

	static register(args) {
		this.schemaStore.set(args);
	}

	static registerProcessor(args) {
		this.processorStore.set(args);
	}

	static registerType({name, value}) {
		if(this.types[name]) {
			throw new FlexSchemaError({
				message: 'Type has already been registered.',
				code: FlexSchemaError.CODES.BAD_ARGUMENTS,
				details: {
					name,
					value
				}
			});
		}

		if(!value.snapshot) {
			value = {
				...value,
				snapshot: SchemaSnapshot
			};
		}

		this.types[name] = value;
	}

	static init(args) {
		validateInitArgs(args);
		validateInitIndividualArgs(args);

		let {namespace, name, schema, resources = []} = args;

		if(name && namespace) {
			const storeInfo = this.schemaStore.get({namespace, name});
			schema = storeInfo.schema;
			resources = [
				...storeInfo.resources,
				...resources
			];
		}

		validateInitSchemaArg({namespace, name, schema, types: this.types});

		const SchemaType = this.types[schema.type].schema;

		return new SchemaType({
			schema,
			resources
		});
	}
}