import Schema from './Schema';
import type from '../Schema/type';
import FlexSchemaError from '../Error';

const initNestedSchema = (args) => {
	switch(type(args)) {
		case 'function':
			return params => {
				const result = args(params);

				if(result instanceof Promise) {
					return result.then(result => initNestedSchema(result)());
				}

				return initNestedSchema(result)();
			};
		case 'object':
			break;
		default:
			throw new FlexSchemaError({
				message: `Invalid nested schema`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					args
				}
			});
	}

	return () => {
		let initializedSchema;

		if((args.name && args.namespace) || (args.schema)) {
			initializedSchema = Schema.init(args);
		}
		else {
			initializedSchema = Schema.init({
				schema: args
			});
		}

		return initializedSchema;
	};
};

export default initNestedSchema;