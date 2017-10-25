import {FlexSchema} from '../../dist/flexschema.esm';

let userSchema = {
	type: 'object',
	shape: {
		profile: {
			type: 'object',
			shape: {
				firstName: {
					type: 'string',
					min: 1,
					max: 100
				}
			}
		}
	}
};

let data = {};

FlexSchema.register({
	namespace: 'example',
	name: 'user',
	schema: userSchema
});

let schema = FlexSchema.init({
	namespace: 'example',
	name: 'user'
});

let context = schema.process({
	data
});

console.log(context.getData());

context = schema.validate({
	data
});

console.log(context.getErrors());

userSchema = {
	type: 'object',
	shape: {
		profile: {
			type: 'object',
			shape: {
				firstName: {
					type: 'string',
					min: 1,
					max: 100
				},
				yearOfBirth: {
					type: 'number',
					min: 1850,
					max: () => (new Date()).getFullYear()
				}
			}
		}
	}
};

FlexSchema.register({
	namespace: 'example',
	name: 'user',
	schema: userSchema
});

schema = FlexSchema.init({
	namespace: 'example',
	name: 'user'
});

data = {
	profile: {
		firstName: 'Ashley',
		yearOfBirth: 2100
	}
};

context = schema.validate({
	data
});

console.log(context.getErrors());