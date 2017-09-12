import FlexSchemaError from '../Error';
import type from './type';

export const validateInitArgs = args => {
	if(!args) {
		throw new FlexSchemaError({
			message: 'No arguments passed to the schema class',
			code: FlexSchemaError.CODES.MISSING_ARGUMENTS,
			details: {
				args
			}
		});
	}
};

export const validateInitIndividualArgs = ({schema, name, namespace}) => {
	if(!schema && (!name || !namespace)) {
		throw new FlexSchemaError({
			message: 'Bad arguments passed to the schema class: you have to pass either schema or both name and namespace',
			code: FlexSchemaError.CODES.BAD_ARGUMENTS,
			details: {
				schema,
				name,
				namespace
			}
		});
	}

	if(!schema && (typeof name !== 'string' || typeof namespace !== 'string')) {
		throw new FlexSchemaError({
			message: 'Both name and namespace must be strings (not empty)',
			code: FlexSchemaError.CODES.BAD_ARGUMENTS,
			details: {
				schema,
				name,
				namespace
			}
		});
	}
};

export const validateInitSchemaArg = ({schema, types}) => {
	if(type(schema) !== 'object') {
		throw new FlexSchemaError({
			message: 'Schema is invalid.',
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(!schema.type) {
		throw new FlexSchemaError({
			message: 'Schema type is invalid.',
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(!types[schema.type]) {
		throw new FlexSchemaError({
			message: 'Unknown schema type.',
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};