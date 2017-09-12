import Schema from '../../Schema/Schema';
import {
	validateSchema,
	validateShape,
	validateValues,
	validateMinAndMax
} from './preprocess';

export default class ArraySchema extends Schema {

	static fields = {
		...Schema.fields,
		'shape':{},
		'values':{},
		'min':{},
		'max':{}
	};

	getEmpty() {
		return [];
	}

	_preprocessSchemaType({schema}) {
		validateSchema({schema});

		if(schema.shape !== undefined) {
			validateShape({schema});
		}
		else {
			validateValues({schema});
			validateMinAndMax({schema});
		}

		return schema;
	}

	_processData(context) {
		const
			shape = context.getField({name: 'shape'}),
			values = context.getField({name: 'values'}),
			arrayPath = context.getCurrentPath();

		if(shape) {
			return this._handleShape({context, shape, arrayPath, type: 'process'});
		}
		else if(values) {
			this._convertValuesFieldToShape({context, arrayPath});

			const
				min = context.getField({name: 'min'}),
				max = context.getField({name: 'max'});

			let data = context.getOriginalData();

			if(!Array.isArray(data)) {
				data = context.getData();
			}

			let targetIndex = data.length;

			if(min > targetIndex) {
				targetIndex = min;
			}

			if(max < targetIndex) {
				targetIndex = max;
			}

			return this._handleValues({context, values, arrayPath, targetIndex, type: 'process'});
		}
	}

	_validateData(context, options) {
		const
			shape = context.getField({name: 'shape'}),
			values = context.getField({name: 'values'}),
			arrayPath = context.getCurrentPath();

		options = {
			...{
				validateChildren: true
			},
			...options
		};

		if(options.validateChildren) {
			if(shape) {
				return this._handleShape({context, shape, arrayPath, type: 'validate'});
			}
			else if(values) {
				this._convertValuesFieldToShape({context, arrayPath});

				const result = this._validateValues({context, values, arrayPath});

				if(result instanceof Promise) {
					return result.then(() => context.go({
						path: arrayPath,
						schema: this
					}));
				}
			}
		}

		context.go({
			path: arrayPath,
			schema: this
		});
	}

	_convertValuesFieldToShape({context, arrayPath}) {
		const schemaSnapshot = context.getSchemaSnapshot();
		schemaSnapshot.extract({path: arrayPath}).setField({name: 'shape', value: []});
	}

	_validateValues({context, values, arrayPath}) {
		const
			data = context.getData(),
			min = context.getField({name: 'min'});

		if(min > data.length) {
			context.addError({
				type: 'min',
				message: `Value must be at least ${min} items long.`
			});
		}

		const result = this._handleValues({context, values, arrayPath, targetIndex: data.length, type: 'validate'});

		if(result instanceof Promise) {
			return result.then(() => {
				const max = context.getField({name: 'max'});

				if(max < data.length) {
					context.addError({
						type: 'max',
						message: `Value must be at maximum ${max} items long.`
					});
				}
			});
		}

		const max = context.getField({name: 'max'});

		if(max < data.length) {
			context.addError({
				type: 'max',
				message: `Value must be at maximum ${max} items long.`
			});
		}
	}

	_handleShape({context, shape, arrayPath, type, index = 0}) {
		if(index < shape.length) {
			let schema = shape[index];

			const path = arrayPath.push(index);

			context.go({
				path,
				schema
			});

			schema = schema(context);

			if(schema instanceof Promise) {
				return schema.then(schema => {
					context.go({
						path,
						schema
					});

					return this._handleShapeLogic({schema, type, context, shape, arrayPath, index});
				});
			}

			context.go({
				path,
				schema
			});

			return this._handleShapeLogic({schema, type, context, shape, arrayPath, index});
		}

		context.go({
			path: arrayPath,
			schema: this,
		});
	}

	_handleShapeLogic({schema, type, context, shape, arrayPath, index}) {
		const result = schema[type].call(schema, null, context);

		index++;

		if(result instanceof Promise) {
			return result.then(() => this._handleShape({context, shape, arrayPath, index}));
		}

		return this._handleShape({context, shape, arrayPath, index});
	}

	_handleValues({context, type, values, arrayPath, targetIndex, index = 0}) {
		if(index < targetIndex) {
			const path = arrayPath.push(index);

			context.go({
				path,
				schema: values
			});

			const result = values[type].call(values, null, context);

			index++;

			if(result instanceof Promise) {
				return result.then(() => this._handleValues({context, type, values, arrayPath, targetIndex, index}));
			}

			this._handleValues({context, type, values, arrayPath, targetIndex, index});
		}

		context.go({
			path: arrayPath,
			schema: this,
		});
	}
}