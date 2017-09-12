import 'babel-polyfill';
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

describe('Register and initialize a schema', async () => {
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

	test('Test schema full data processing', async () => {
		const context = await schema.process({
			data: userData
		});

		await expect(context.getData()).toEqual(userData);
	});

	test('Test schema full data validating', async () => {
		const context = await schema.validate({
			data: userData
		});

		await expect(context.isValid()).toEqual(true);
	});

	test('Test schema empty data processing', async () => {
		const context = await schema.process({
			data: undefined
		});

		await expect(context.getData()).toEqual(emptyUserData);
	});

	test('Test schema invalid data validating', async () => {
		const context = await schema.validate({
			data: invalidUserData
		});

		await expect(context.isValid()).toEqual(false);
	});

	test('Test schema empty data processing with runtime conditional', async () => {
		const context = await schema.process({
			data: undefined,
			resources: [
				{
					path: 'profile.firstName',
					values: {
						if: () => () => false
					}
				}
			]
		});

		await expect(context.getData()).toEqual(emptyConditionalUserData);
	});
});