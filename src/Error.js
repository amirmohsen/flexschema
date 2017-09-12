import ExtendableError from 'es6-error';
import stringify from 'json-stringify-safe';

export default class FlexSchemaError extends ExtendableError {

	static CODES = {
		MISSING_ARGUMENTS: 'MISSING_ARGUMENTS',
		BAD_ARGUMENTS: 'BAD_ARGUMENTS',
		NO_SUCH_SCHEMA: 'NO_SUCH_SCHEMA',
		NO_SUCH_PROCESSOR: 'NO_SUCH_PROCESSOR',
		BAD_SCHEMA: 'BAD_SCHEMA',
		BAD_RESOURCE: 'BAD_RESOURCE',
		BAD_PROCESSOR: 'BAD_PROCESSOR',
		BAD_DATA: 'BAD_DATA'
	};

	constructor({message, code, details = {}}) {
		super(stringify({
			message,
			code,
			details
		}, null, '\t'));
		this.code = code;
		this.details = details;
	}
}