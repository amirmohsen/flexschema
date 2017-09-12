import {
	ObjectSchema,
	ArraySchema,
	StringSchema,
	NumberSchema,
	BooleanSchema,
	DynamicSchema,
	ObjectSnapshot,
	ArraySnapshot,
	StringSnapshot,
	NumberSnapshot,
	BooleanSnapshot,
	DynamicSnapshot
} from '../src/types';
import Schema from './Schema/Schema';

Schema.types = {
	object: {
		schema: ObjectSchema,
		snapshot: ObjectSnapshot
	},
	array: {
		schema: ArraySchema,
		snapshot: ArraySnapshot
	},
	string: {
		schema: StringSchema,
		snapshot: StringSnapshot
	},
	number: {
		schema: NumberSchema,
		snapshot: NumberSnapshot
	},
	boolean: {
		schema: BooleanSchema,
		snapshot: BooleanSnapshot
	},
	dynamic: {
		schema: DynamicSchema,
		snapshot: DynamicSnapshot
	}
};

export default Schema;
export {default as SchemaSnapshot} from './Schema/SchemaSnapshot';
export {default as type} from './Schema/type';
export {default as Error} from './Error';
export {default as Loader} from './Loader';
export {default as Path} from './Path';
export {default as SchemaStore} from './Store/SchemaStore';
export {default as ProcessorStore} from './Store/ProcessorStore';
export {default as Constants} from './Constants';