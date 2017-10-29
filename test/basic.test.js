import {FlexSchema} from '../dist/flexschema.cjs';
import {validData, schema as userSchema} from './data/basicUser';

FlexSchema.register({
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

const schema = FlexSchema.init({
	namespace: 'test',
	name: 'user'
});

test('Test schema full data processing', () => {
	const context = schema.process({
		data: validData
	});

	expect(context.getData()).toEqual(validData);
});
