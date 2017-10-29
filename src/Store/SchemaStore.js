import FlexSchemaError from '../Error';
import Loader from '../Loader';
import type from '../Schema/type';
import BaseStore from './BaseStore';

export default class SchemaStore extends BaseStore {

	loader = new Loader();

	has({namespace, name}) {
		this._validateNameAndNamespace({namespace, name});
		return super.has({path: [namespace, name]});
	}

	hasNamespace({namespace}) {
		this._validateNamespace({namespace});
		return super.has({path: [namespace]});
	}

	set({namespace, name, schema, resources = []}) {
		this._validateNameAndNamespace({namespace, name});
		this._validateResources({namespace, name, schema, resources});
		super.set({
			path: [namespace, name],
			value: {
				schema,
				resources
			}
		});
	}

	get({namespace, name}) {
		this._validateNameAndNamespace({namespace, name});
		if(!this.has({namespace, name})) {
			const schema = this.loader.find({namespace, name});

			if(schema) {
				this.set({namespace, name, schema});
				return schema;
			}

			throw new FlexSchemaError({
				message: `No schema with the namespace "${namespace}" and the name "${name}" exists.`,
				code: FlexSchemaError.CODES.NO_SUCH_SCHEMA,
				details: {
					namespace,
					name
				}
			});
		}
		return super.get({path: [namespace, name]});
	}

	remove({namespace, name}) {
		this._validateNameAndNamespace({namespace, name});
		if(this.has({namespace, name})) {
			super.remove({path: [namespace, name]});
		}
	}

	removeNamespace({namespace}) {
		this._validateNamespace({namespace});
		if(this.hasNamespace({namespace})) {
			super.remove({path: [namespace]});
		}
	}

	_validateNameAndNamespace({namespace, name}) {
		if(typeof namespace !== 'string' || typeof name !== 'string') {
			throw new FlexSchemaError({
				message: `Namespace and Name must be strings`,
				code: FlexSchemaError.CODES.BAD_ARGUMENTS,
				details: {
					namespace,
					name
				}
			});
		}
	}

	_validateNamespace({namespace}) {
		if(typeof namespace !== 'string') {
			throw new FlexSchemaError({
				message: `Namespace must be a string`,
				code: FlexSchemaError.CODES.BAD_ARGUMENTS,
				details: {
					namespace
				}
			});
		}
	}

	_validateResources({namespace, name, schema, resources}) {
		if(type(resources) !== 'array') {
			throw new FlexSchemaError({
				message: `Resources collection must be an array`,
				code: FlexSchemaError.CODES.BAD_RESOURCE,
				details: {
					namespace,
					name,
					schema,
					resources
				}
			});
		}
	}
}