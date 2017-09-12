import Schema from '../Schema/Schema';

export default class SchemaSnapshot {

	_fields = {};

	setField({name, value}) {
		this._fields[name] = value;
	}

	setFields({values}) {
		this._fields = values;
	}

	getField({name}) {
		return this._fields[name];
	}

	getFields() {
		return this._fields;
	}

	// Defined by object and array types
	extract({path}) {
		return this;
	}

	// Defined by object and array types
	setChild({name, value}) {}

	static init({type}) {
		const SchemaSnapshotType = Schema.types[type].snapshot;
		return new SchemaSnapshotType();
	}
}