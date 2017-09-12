import type from '../Schema/type';
import FlexSchemaError from '../Error';
import Path from '../Path';

export default (resource) => {
	if(type(resource) !== 'object') {
		throw new FlexSchemaError({
			message: `Invalid resource: it must be an object`,
			code: FlexSchemaError.CODES.BAD_RESOURCE,
			details: {
				resource
			}
		});
	}

	let {path, name, condition, values} = resource;

	if(!path && !name && !condition) {
		throw new FlexSchemaError({
			message: `Invalid resource: at least one of the following needs to be defined: "name", "path" and "condition".`,
			code: FlexSchemaError.CODES.BAD_RESOURCE,
			details: {
				resource
			}
		});
	}

	if(type(path) !== 'undefined') {
		path = Path.normalize({path});
	}

	if(type(name) !== 'undefined' && (type(name) !== 'string' || !name)) {
		throw new FlexSchemaError({
			message: `Invalid resource: optional "name" must be a non-empty string.`,
			code: FlexSchemaError.CODES.BAD_RESOURCE,
			details: {
				resource
			}
		});
	}

	if(type(condition) !== 'undefined' && type(condition) !== 'boolean' && type(condition) !== 'function') {
		throw new FlexSchemaError({
			message: `Invalid resource: optional "condition" must be a boolean or a function that evaluates to one.`,
			code: FlexSchemaError.CODES.BAD_RESOURCE,
			details: {
				resource
			}
		});
	}

	if(type(values) !== 'undefined' && type(values) !== 'object') {
		// TODO: better validation of the shape of values
		throw new FlexSchemaError({
			message: `Invalid resource: "values" must be an object.`,
			code: FlexSchemaError.CODES.BAD_RESOURCE,
			details: {
				resource
			}
		});
	}
};