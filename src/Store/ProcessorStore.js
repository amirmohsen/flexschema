import FlexSchemaError from '../Error';
import Loader from '../Loader';
import lodash from 'lodash';
import type from '../Schema/type';

const {
	get,
	set,
	has
} = lodash;

export default class ProcessorStore {

	loader = new Loader();

	data = {};

	has({namespace, name}) {
		this._validateNameAndNamespace({namespace, name});
		return has(this.data, [namespace, name]);
	}

	set({namespace, name, processor}) {
		this._validateNameAndNamespace({namespace, name});
		this._validateProcessor({namespace, name, processor});
		set(this.data, [namespace, name], {	processor });
	}

	get({namespace, name}) {
		this._validateNameAndNamespace({namespace, name});
		if(!this.has({namespace, name})) {
			const processor = this.loader.find({namespace, name});

			if(processor) {
				this.set({namespace, name, processor});
				return processor;
			}

			throw new FlexSchemaError({
				message: `No processor with the namespace "${namespace}" and the name "${name}" exists.`,
				code: FlexSchemaError.CODES.NO_SUCH_PROCESSOR,
				details: {
					namespace,
					name
				}
			});
		}
		return get(this.data, [namespace, name]);
	}

	remove({namespace, name}) {
		this._validateNameAndNamespace({namespace, name});
		if(this.has({namespace, name})) {
			super.remove({path: [namespace, name]});
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

	_validateProcessor({namespace, name, processor}) {
		if(type(processor) !== 'function') {
			throw new FlexSchemaError({
				message: `Processor must be a function`,
				code: FlexSchemaError.CODES.BAD_PROCESSOR,
				details: {
					namespace,
					name,
					processor
				}
			});
		}
	}
}