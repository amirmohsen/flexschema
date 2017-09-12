import FlexSchemaError from '../../Error';
import type from '../../Schema/type';

const formatFields = [
	'int',
	'float',
	'number',
	'objectid',
	'datetime',
	'email'
];

export const validateMinAndMax = ({schema}) => {
	if(type(schema.min) === 'undefined') {
		schema.min = 0;
	}
	else if(!Number.isInteger(schema.min) || schema.min < 0) {
		throw new FlexSchemaError({
			message: `String Schema's optional field "min" has to be an integer and equal to or greater than zero`,
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
			message: `String Schema's optional field "max" has to be an integer and equal to or greater than zero or "infinity" string or Infinity (zero also means infinity)`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(schema.min > schema.max) {
		throw new FlexSchemaError({
			message: `String Schema's optional field "min" cannot be greater than optional field "max".`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};

export const validateCanBeEmpty = ({schema}) => {
	const canBeEmptyType = type(schema.canBeEmpty);
	if(canBeEmptyType === 'undefined') {
		schema.canBeEmpty = true;
	}
	else if(canBeEmptyType !== 'boolean' && canBeEmptyType !== 'function') {
		throw new FlexSchemaError({
			message: `String Schema's optional field "canBeEmpty" must be either a boolean or a function evaluating to one.`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};

export const validateFormat = ({schema}) => {
	if(type(schema.format) === 'undefined') {
		schema.format = '';
	}
	else if(type(schema.format) !== 'string' || !formatFields.includes(schema.format)) {
		throw new FlexSchemaError({
			message: `String Schema's optional field "format" has to be a string and one of "int", "float", "number", "objectid", "datetime" (ISO 8601), "date", "time"`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};