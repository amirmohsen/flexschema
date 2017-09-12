import FlexSchemaError from '../../Error';
import type from '../../Schema/type';
import initNestedSchema from '../../Schema/initNestedSchema';

export const validateSchema = ({schema}) => {
	if(schema.shape && (schema.keys || schema.values)) {
		throw new FlexSchemaError({
			message: `Object Schema can either have the shape field or the keys and values fields but not both`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};

export const validateShape = ({schema}) => {
	if(type(schema.shape) !== 'object' && type(schema.shape) !== 'function') {
		throw new FlexSchemaError({
			message: `Object Schema's shape must be an object or a function returning an object.`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.min) !== 'undefined' || type(schema.max) !== 'undefined') {
		throw new FlexSchemaError({
			message: `Object Schema's min and max cannot be used in conjunction with the shape.`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.shape) !== 'function') {
		for(const key in schema.shape) {
			schema.shape[key] = initNestedSchema(schema.shape[key]);
		}
	}
};

const preprocessObjectKey = ({keySchema}) => {
	if(type(keySchema) !== 'function' && keySchema.type !== 'string') {
		throw new FlexSchemaError({
			message: `Object Schema keys can only be of "string" type or a function that returns such.`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				keySchema
			}
		});
	}

	return initNestedSchema(keySchema);
};

export const validateKeys = ({schema}) => {
	switch(type(schema.keys)) {
		case 'undefined':
			break;
		case 'function':
		case 'object':
			schema.keys = preprocessObjectKey({keySchema: schema.keys});
			break;
		default:
			throw new FlexSchemaError({
				message: `Object Schema's optional field "keys" must be either a schema or an array of schemas or a function that returns such.`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					schema
				}
			});
	}
};

export const validateValues = ({schema}) => {
	switch(type(schema.values)) {
		case 'function':
		case 'object':
			schema.values = initNestedSchema(schema.values);
			break;
		default:
			throw new FlexSchemaError({
				message: `Object Schema's values must be either a schema or an array of schemas or a function that returns such.`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					schema
				}
			});
	}
};

export const validateMinAndMax = ({schema}) => {
	if(type(schema.min) === 'undefined') {
		schema.min = 0;
	}
	else if(!Number.isInteger(schema.min) || schema.min < 0) {
		throw new FlexSchemaError({
			message: `Object Schema's optional field "min" has to be an integer and equal to or greater than zero.`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.max) === 'undefined' || schema.max === 0 || (typeof schema.max === 'string' && schema.max.toLowerCase() === 'infinity')) {
		schema.max = Infinity;
	}
	else if(!Number.isInteger(schema.max) || schema.max < 0) {
		throw new FlexSchemaError({
			message: `Object Schema's optional field "max" has to be an integer and equal to or greater than zero or "infinity" string or Infinity (zero also means infinity).`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(schema.min > schema.max) {
		throw new FlexSchemaError({
			message: `Object Schema's optional field "min" cannot be greater than optional field "max".`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};