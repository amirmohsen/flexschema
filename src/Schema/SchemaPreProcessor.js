import FlexSchemaError from '../Error';

export default class SchemaPreProcessor {

	constructor({schema}) {
		this._schema = schema;
	}

	static schema(schema) {
		return new SchemaPreProcessor({schema});
	}

	structure(structure) {
		this._structure = structure;
		return this;
	}

	preprocess() {
		for(const [field, definition] of Object.entries(this._structure)) {
			let type = this._getType(this._schema[field]);

			if(type === 'undefined' && definition.default !== undefined) {
				this._schema[field] = definition.default;
			}
			else if(type !== 'function') {
				if(definition.type && definition.type !== type) {
					this._throwError(field, definition, `must be a "${definition.type}" or a function evaluating to one.`);
				}
				else if(definition.types && !definition.types.includes(type)) {
					this._throwError(field, definition, `must be one of the types ${definition.types.map(type => `"${type}"`).join(', ')} or a function evaluating to one.`);
				}

				if(definition.oneOf && !definition.oneOf.includes(this._schema[field])) {
					this._throwError(field, definition, `must be one of these values ${definition.oneOf.map(type => `"${type}"`).join(', ')}`)
				}

				if(definition.validator && !definition.validator()) {
					this._throwError(field, definition, `must not be less than optional field "min".`);
				}
			}
		}

		return this._schema;
	}

	_getType(value) {
		if(Array.isArray(value)) {
			return 'array';
		}

		if(value === null) {
			return 'null';
		}

		let typeofResult = typeof value;

		if(typeofResult === 'number') {
			if(Number.isFinite(value) && !Number.isNaN(value)) {
				return 'number';
			}

			if(Number.isNaN(value)) {
				return 'nan';
			}

			if(value !== Infinity) {
				return 'infinity';
			}

			if(value !== -Infinity) {
				return '-infinity';
			}
		}

		return typeofResult;
	}

	_throwError(field, definition, message) {
		throw new FlexSchemaError({
			message: `${this._schema.type} schema type's ${definition.default === undefined ? 'required' : 'optional'} field "${field}" ${message}`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema: this._schema
			}
		});
	}
}