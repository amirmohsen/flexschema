import {stripIndent} from 'common-tags'
import FlexSchemaError from '../Error';
import type from './type';

export const preprocessSchemaDefault = ({schema, builtinDataTypes}) => {
	switch(type(schema.default)) {
		case 'undefined':
		case 'function':
		case schema.type:
			break;
		default:
			if(builtinDataTypes.includes(schema.type)) {
				throw new FlexSchemaError({
					message: `Schema's optional field "default" must be either the same type as the schema or a function that evaluates to that type.`,
					code: FlexSchemaError.CODES.BAD_SCHEMA,
					details: {
						schema
					}
				});
			}
	}
};

export const preprocessSchemaIf = ({schema}) => {
	switch(type(schema.ifCondition)) {
		case 'undefined':
			schema.ifCondition = () => () => true;
			break;
		case 'function':
			break;
		default:
			throw new FlexSchemaError({
				message: `Schema's optional field "if" must be a function that evaluates to a function that evaluates to a boolean.`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					schema
				}
			});
	}
};

export const preprocessSchemaProcess = ({schema}) => {
	switch(type(schema.process)) {
		case 'undefined':
			schema.process = true;
			break;
		case 'boolean':
		case 'function':
			break;
		default:
			throw new FlexSchemaError({
				message: `Schema's optional field "process" must be either boolean or a function that evaluates to boolean.`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					schema
				}
			});
	}
};

export const preprocessSchemaOptional = ({schema}) => {
	switch(type(schema.optional)) {
		case 'undefined':
			schema.optional = false;
			break;
		case 'boolean':
		case 'function':
			break;
		default:
			throw new FlexSchemaError({
				message: `Schema's optional field "optional" must be either boolean or a function that evaluates to boolean.`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					schema
				}
			});
	}
};

export const preprocessSchemaNullable = ({schema}) => {
	switch(type(schema.nullable)) {
		case 'undefined':
			schema.nullable = false;
			break;
		case 'boolean':
		case 'function':
			break;
		default:
			throw new FlexSchemaError({
				message: `Schema's optional field "nullable" must be either boolean or a function that evaluates to boolean.`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					schema
				}
			});
	}
};

const preprocessSchemaActions = ({schema, name}) => {
	switch(type(schema[name])) {
		case 'undefined':
			return schema[name] = [];
		case 'array':
			let validated = true;

			for(const item of schema[name]) {
				const itemType = type(item);
				if(itemType !== 'function' && itemType !== 'string' && !itemType) {
					validated = false;
					break;
				}
			}

			if(validated) {
				return;
			}
	}

	throw new FlexSchemaError({
		message: stripIndent`
					Schema's optional field "${name}" must be an array of functions or names of methods
					that are exposed on the schema type class or a function returning such an array
				`,
		code: FlexSchemaError.CODES.BAD_SCHEMA,
		details: {
			schema
		}
	});
};

export const preprocessSchemaProcessors = ({schema}) => {
	preprocessSchemaActions({
		schema,
		name: 'preprocessors'
	});

	preprocessSchemaActions({
		schema,
		name: 'postprocessors'
	});
};

export const preprocessSchemaValidators = ({schema}) => {
	preprocessSchemaActions({
		schema,
		name: 'prevalidators'
	});

	preprocessSchemaActions({
		schema,
		name: 'postvalidators'
	});
};

export const preprocessSchemaOneOf = ({schema}) => {
	switch(type(schema.oneOf)) {
		case 'undefined':
			schema.oneOf = [];
			break;
		case 'array':
			for(const acceptableValue of schema.oneOf) {
				if(typeof acceptableValue !== schema.type || acceptableValue === null) {
					throw new FlexSchemaError({
						message: `Schema's optional field "oneOf" contains values that don't match the schema type. Empty array allows everything. null shouldn't be used inside oneOf. For nullable values, set "nulalble" field to true.`,
						code: FlexSchemaError.CODES.BAD_SCHEMA,
						details: {
							schema
						}
					});
				}
			}
			break;
		case 'function':
			break;
		default:
			throw new FlexSchemaError({
				message: `Schema's optional field "oneOf" must be an array of values matching the type or a function evaluating to such an array.`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					schema
				}
			});
	}
};

export const preprocessSchemaMetadata = ({schema}) => {
	switch(type(schema.metadata)) {
		case 'undefined':
			schema.metadata = {};
			break;
		case 'function':
			break;
		default:
			if(type(schema.metadata) !== 'object') {
				throw new FlexSchemaError({
					message: `Schema's optional field "metadata" must be an object.`,
					code: FlexSchemaError.CODES.BAD_SCHEMA,
					details: {
						schema
					}
				});
			}
	}
};