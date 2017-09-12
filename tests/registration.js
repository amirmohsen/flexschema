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
import Schema from '../src/Schema/Schema';
import userSchema from './samples/user.schema';
import userData from './samples/user.data';
import emptyUserData from './samples/user.data.empty';
import invalidUserData from './samples/user.data.invalid';
import emptyConditionalUserData from './samples/user.data.empty.conditional';

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

process.on('unhandledRejection', (reason, p) => { throw reason });

const run = async () => {
	Schema.register({
		namespace: 'test',
		name: 'user',
		schema: userSchema,
		resources: [
			{
				path: 'profile.dob',
				values: {
					max: () => (new Date()).getFullYear()
				}
			}
		]
	});

	const schema = Schema.init({
		namespace: 'test',
		name: 'user'
	});

	const context = await schema.process({
		data: userData
	});

	console.log(context.getData());
};

run();