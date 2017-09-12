import extend from 'extend';
import Path from './Path';
import Schema from './Schema/Schema';
import SchemaSnapshot from './Schema/SchemaSnapshot';
import FieldResolver from './FieldResolver';
import type from './Schema/type';

export default class Context {

	static DEFAULT_OPTIONS = {
		validate: false
	};

	_data;
	_processedData;
	_schema;
	_schemaSnapshot;
	_fieldResolver;
	_options;
	_currentPath;
	_currentSchema;
	_errors;

	constructor({data, processedData, schema, resources = {}, options = {}}) {
		this._data = data;
		this._processedData = processedData;
		this._schema = schema;
		this._schemaSnapshot = SchemaSnapshot.init({type: schema.getType()});
		this._fieldResolver = new FieldResolver({resources, context: this});
		this._options = extend(true, {}, this.constructor.DEFAULT_OPTIONS, options);
		this._currentPath = new Path();
		this._currentSchema = schema;
		this._errors = [];
	}

	go({path, schema}) {
		this._currentPath = path;
		this._currentSchema = schema;

		const schemaSnapshot = this._schemaSnapshot.extract({path: this._currentPath});

		if(!(schemaSnapshot instanceof SchemaSnapshot) && this._currentSchema instanceof Schema) {
			const
				name = this._currentPath.last(),
				parentPath = this._currentPath.pop();

			const SchemaSnapshotType = Schema.types[this._currentSchema.getType()].snapshot;

			this._schemaSnapshot.extract({path: parentPath}).setChild({name, value: new SchemaSnapshotType()});
		}
	}

	isRoot() {
		return this._currentPath.isRoot();
	}

	shouldValidate() {
		return this._options.validate;
	}

	shouldValidateChildren() {
		return this._options.validateChildren;
	}

	getCurrentPath() {
		return this._currentPath;
	}

	getCurrentSchema() {
		return this._currentSchema;
	}

	getSchemaSnapshot() {
		return this._schemaSnapshot;
	}

	processAllFields(...args) {
		return this._fieldResolver.resolveAll(...args);
	}

	processField(...args) {
		return this._fieldResolver.resolve(...args);
	}

	getField({name}) {
		return this._schemaSnapshot.extract({path: this._currentPath}).getField({name});
	}

	getData() {
		return this._currentPath.getData({data: this._processedData});
	}

	getOriginalData() {
		return this._currentPath.getData({data: this._data});
	}

	setData({data}) {
		this._processedData = this._currentPath.setData({data: this._processedData, newData: data});
	}

	delData() {
		this._processedData = this._currentPath.delData({data: this._processedData});
	}

	pushData({data}) {
		this._processedData = this._currentPath.pushData({data: this._processedData, newData: data});
	}

	getEntireData() {
		return this._processedData;
	}

	getEntireOriginalData() {
		return this._data;
	}

	addError(error, options = {}) {
		options = extend(true, { serialize: {} }, options);

		if(!error.details) {
			error.details = {};
		}

		if(!error.details.context) {
			error.details = {
				...error.details,
				context: this.serialize(options.serialize)
			};
		}

		this._errors.push(error);
	}

	hasErrors() {
		return !!this._errors.length;
	}

	getErrors() {
		return this._errors;
	}

	isValid() {
		return !this.hasErrors();
	}

	serialize({include = []} = {include: []}) {
		include = [
			...[
				'data',
				'processedData',
				'schema',
				'currentPath',
				'currentSchema'
			],
			...include
		];

		const output = {};

		for(const field of include) {
			if(this[`_${field}`] && type(this[`_${field}`]) !== 'function') {
				output[field] = this[`_${field}`];
			}
		}

		return output;
	}
}