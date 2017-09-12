import Schema from '../../Schema/Schema';
import {
	validateSchema,
	validateShape,
	validateKeys,
	validateValues,
	validateMinAndMax
} from './preprocess';
import type from '../../Schema/type';

export default class ObjectSchema extends Schema {

	static fields = {
		...Schema.fields,
		'shape': {},
		'keys': {},
		'values': {},
		'min': {},
		'max': {}
	};

	getEmpty() {
		return {};
	}

	_preprocessSchemaType({schema}) {
		validateSchema({schema});

		if(schema.shape !== undefined) {
			validateShape({schema});
		}
		else {
			if(schema.keys !== undefined) {
				validateKeys({schema});
			}

			validateValues({schema});
			validateMinAndMax({schema});
		}

		return schema;
	}

	_processData(context) {
		const
			shape = context.getField({name: 'shape'}),
			keys = context.getField({name: 'keys'}),
			values = context.getField({name: 'values'}),
			objectPath = context.getCurrentPath();

		if(shape) {
			return this._handleShape({context, shape, objectPath, type: 'process'});
		}
		else if(keys || values) {
			this._convertValuesFieldToShape({context, objectPath});

			let data = context.getOriginalData();

			if(type(data) !== 'object') {
				data = context.getData();
			}

			const result = this._handleKeysAndValues({context, data, keys, values, objectPath, type: 'process'});

			if(result instanceof Promise) {
				return result.then(() => {
					context.go({
						path: objectPath,
						schema: this
					});
					this._handlePostprocess({context, objectPath});
				});
			}

			this._handlePostprocess({context, objectPath});
		}

		context.go({
			path: objectPath,
			schema: this
		});
	}

	_handlePostprocess({context, objectPath}) {
		context.go({
			path: objectPath,
			schema: this
		});

		const max = context.getField({name: 'max'});

		let data = context.getData();

		if(max < Infinity && max < Object.keys(data).length) {
			data = Object
				.keys(data)
				.slice(0, max)
				.reduce((filteredData, key) => {
					filteredData[key] = data[key];
					return filteredData;
				}, {});

			context.setData({
				data
			});
		}
	}

	_validateData(context, options = {}) {
		const
			shape = context.getField({name: 'shape'}),
			keys = context.getField({name: 'keys'}),
			values = context.getField({name: 'values'}),
			objectPath = context.getCurrentPath();

		options = {
			...{
				validateChildren: true
			},
			...options
		};

		if(options.validateChildren) {
			if(shape) {
				return this._handleShape({context, shape, objectPath, type: 'validate'});
			}
			else if(keys || values) {
				this._convertValuesFieldToShape({context, objectPath});

				const data = context.getData();

				const result = this._handleKeysAndValues({context, data, keys, values, objectPath, type: 'validate'});

				if(result instanceof Promise) {
					return result.then(() => {
						context.go({
							path: objectPath,
							schema: this
						});
						this._handlePostvalidate({context, data});
					});
				}

				context.go({
					path: objectPath,
					schema: this
				});

				this._handlePostvalidate({context, data});
			}
		}

		context.go({
			path: objectPath,
			schema: this
		});
	}

	_handlePostvalidate({context, data}) {
		const
			min = context.getField({name: 'min'}),
			max = context.getField({name: 'max'}),
			length = Object.keys(data).length;

		if(min > length) {
			context.addError({
				type: 'min',
				message: `Value must be at least ${min} items long.`
			});
		}

		if(max < length) {
			context.addError({
				type: 'max',
				message: `Value must be at maximum ${max} items long.`
			});
		}
	}

	_handleShape({context, shape, objectPath, type, index = 0, shapeKeyValueArray = Object.entries(shape)}) {
		if(index < shapeKeyValueArray.length) {
			let [key, schema] = shapeKeyValueArray[index];

			const path = objectPath.push(key);

			context.go({
				path,
				schema
			});

			schema = schema(context);

			if(schema instanceof Promise) {
				return schema.then(schema => this._handleShapeSchema({schema, type, path, context, shape, objectPath, index, shapeKeyValueArray}));
			}

			return this._handleShapeSchema({schema, type, path, context, shape, objectPath, index, shapeKeyValueArray});
		}

		context.go({
			path: objectPath,
			schema: this
		});
	}

	_handleShapeSchema({schema, type, path, context, shape, objectPath, index, shapeKeyValueArray}) {
		context.go({
			path,
			schema
		});

		return this._handleShapeLogic({schema, type, context, shape, objectPath, index, shapeKeyValueArray});
	}

	_handleShapeLogic({schema, type, context, shape, objectPath, index, shapeKeyValueArray}) {
		const result = schema[type].call(schema, null, context);

		index++;

		if(result instanceof Promise) {
			return result.then(() => this._handleShape({context, type, shape, objectPath, index, shapeKeyValueArray}));
		}

		return this._handleShape({context, type, shape, objectPath, index, shapeKeyValueArray});
	}

	_handleKeysAndValues({context, type, keys, values, data, objectPath, index = 0, dataKeyValueArray = Object.entries(data)}) {
		if(index < dataKeyValueArray.length) {
			const
				[key] = dataKeyValueArray[index],
				path = objectPath.push(key);

			if(keys) {
				let keyContext;

				if(type === 'validate') {
					keyContext = keys.validate({data: key});
				}
				else {
					keyContext = keys.process({data: key, validate: true});
				}

				if(keyContext instanceof Promise) {
					return keyContext.then(keyContext => {
						if(type === 'process' && keyContext.hasErrors()) {
							index++;
							return this._handleKeysAndValues({context, type, keys, values, data, objectPath, index, dataKeyValueArray});
						}

						context.go({
							path,
							schema: values
						});

						return this._handleValuesLogic({context, type, keys, values, data, objectPath, index, dataKeyValueArray});
					});
				}

				if(type === 'process' && keyContext.hasErrors()) {
					index++;
					return this._handleKeysAndValues({context, type, keys, values, data, objectPath, index, dataKeyValueArray});
				}
			}

			context.go({
				path,
				schema: values
			});

			return this._handleValuesLogic({context, type, keys, values, data, objectPath, index, dataKeyValueArray});
		}

		context.go({
			path: objectPath,
			schema: this
		});
	}

	_convertValuesFieldToShape({context, objectPath}) {
		const schemaSnapshot = context.getSchemaSnapshot();
		schemaSnapshot.extract({path: objectPath}).setField({name: 'shape', value: {}});
	}

	_handleValuesLogic({context, type, keys, values, data, objectPath, index, dataKeyValueArray}) {
		const result = values[type](null, context);

		index++;

		if(result instanceof Promise) {
			return result.then(() => this._handleKeysAndValues({context, type, keys, values, data, objectPath, index, dataKeyValueArray}));
		}

		return this._handleKeysAndValues({context, type, keys, values, data, objectPath, index, dataKeyValueArray});
	}
}