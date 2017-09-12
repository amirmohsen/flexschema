import FlexSchemaError from '../../Error';
import type from '../../Schema/type';
import initNestedSchema from '../../Schema/initNestedSchema';

export const validateSchema = ({schema}) => {
	if(schema.shape && schema.values) {
		throw new FlexSchemaError({
			message: `Array Schema can either have the shape field or the values field but not both`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};

export const validateShape = ({schema}) => {
	if(type(schema.shape) !== 'array' && type(schema.shape) !== 'function') {
		throw new FlexSchemaError({
			message: `Array Schema's shape must be an array or a function returning an array`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.min) !== 'undefined' || type(schema.max) !== 'undefined') {
		throw new FlexSchemaError({
			message: `Array Schema's min and max cannot be used in conjunction with the shape.`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.shape) !== 'function') {
		for(const [index, fieldSchema] of Object.entries(schema.shape)) {
			schema.shape[index] = initNestedSchema(fieldSchema);
		}
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
				message: `Array Schema's values must be either a schema or a function returning one`,
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
			message: `Array Schema's optional field "min" has to be an integer and equal to or greater than zero`,
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
			message: `Array Schema's optional field "max" has to be an integer and equal to or greater than zero or "infinity" string or Infinity (zero also means infinity)`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(schema.min > schema.max) {
		throw new FlexSchemaError({
			message: `Array Schema's optional field "min" cannot be greater than optional field "max".`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};