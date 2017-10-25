import FlexSchemaError from '../../Error';
import type from '../../Schema/type';

const numberTypes = [
	'integer',
	'float',
	'digit',
	'fractional'
];

export const validateMinAndMax = ({schema}) => {
	if(type(schema.inclusiveMin) === 'undefined') {
		schema.inclusiveMin = true;
	}
	else if(type(schema.inclusiveMin) !== 'function' && type(schema.inclusiveMin) !== 'boolean') {
		throw new FlexSchemaError({
			message: `Number Schema's optional field "inclusiveMin" must be a boolean.`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.inclusiveMax) === 'undefined') {
		schema.inclusiveMax = true;
	}
	else if(type(schema.inclusiveMax) !== 'function' && type(schema.inclusiveMax) !== 'boolean') {
		throw new FlexSchemaError({
			message: `Number Schema's optional field "inclusiveMax" must be a boolean.`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.min) === 'undefined') {
		schema.min = -Infinity;
	}
	else if((type(schema.min) !== 'function' && !Number.isInteger(schema.min)) || schema.min < 0) {
		throw new FlexSchemaError({
			message: `Number Schema's optional field "min" has to be an integer and equal to or greater than zero`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.max) === 'undefined' || schema.max === 0 || (typeof schema.max === 'string' && schema.max.toLowerCase() === 'infinity')) {
		schema.max = Infinity;
	}
	else if((type(schema.max) !== 'function' && !Number.isInteger(schema.max)) || schema.max < 0) {
		throw new FlexSchemaError({
			message: `Number Schema's optional field "max" has to be an integer and equal to or greater than zero or "infinity" string or Infinity (zero also means infinity)`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}

	if(type(schema.min) !== 'function' && Number.isInteger(schema.max) && schema.min > schema.max) {
		throw new FlexSchemaError({
			message: `Number Schema's optional field "min" cannot be greater than optional field "max".`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};

export const validateNumberType = ({schema}) => {
	if(type(schema.numberType) === 'undefined') {
		schema.numberType = 'float';
	}
	else if((type(schema.numberType) !== 'function' && type(schema.numberType) !== 'string') || !numberTypes.includes(schema.numberType)) {
		throw new FlexSchemaError({
			message: `Number Schema's optional field "numberType" has to be a string and one of "integer", "float", "digit", "fractional"`,
			code: FlexSchemaError.CODES.BAD_SCHEMA,
			details: {
				schema
			}
		});
	}
};