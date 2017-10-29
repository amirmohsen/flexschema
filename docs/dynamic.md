# Dynamic Schemas
The power of FlexSchema lies in its highly dynamic nature.

Let's start with a simple example:

```js
let userSchema = {
	type: 'object',
	shape: {
		profile: {
			type: 'object',
			shape: {
				firstName: {
					type: 'string',
					canBeEmpty: false
				},
				lastName: {
					type: 'string',
					canBeEmpty: false
				},
				age: {
					type: 'number',
					numberType: 'integer',
					min: 0
				}
			}
		},
		medical: {
			type: 'object',
			shape: {
				bloodType: {
					type: 'string',
					oneOf: [
						'O+',
						'O-',
						'A+',
						'A-',
						'B+',
						'B-',
						'AB+',
						'AB-'
					]
				},
				weeklyAlcoholConsumptionUnits: {
					type: 'number',
					numberType: 'integer',
					min: 0
				}
			}
		}
	}
};
```

Let's say you only want to include the "weeklyAlcoholConsumptionUnits" field in the schema
if the user's age is at least 18.

To do this, we use the if field as a function:

```js
// partial schema
let userSchema = {
	type: 'object',
	shape: {
		medical: {
			type: 'object',
			shape: {
				weeklyAlcoholConsumptionUnits: {
					type: 'number',
					numberType: 'integer',
					min: 0,
					if: context => {
						let
							data = context.getEntireData(),
							currentPath = context.getCurrentPath(),
							agePath = currentPath.pop(2).push('profile.age'),
							ageValue = agePath.getData({data});
						
						return ageValue >= 18;
					}
				}
			}
		}
	}
};
```
All fields (except `type`) can be functions.
Functions are evaluated at runtime with the context object as the only argument.
[Context](context.md) object contains information about the current state of data processing.
[Path](path.md) holds data's path information.

Function fields can be async. Let's look at another example:

```js
// partial schema
let userSchema = {
	type: 'object',
	shape: {
		roles: {
			type: 'array',
			values: {
				type: 'string',
				format: 'objectid'
			},
			oneOf: async () => {
				// async api request - getting role ids
				const roles = await API.roles.get();
				return roles.map(({_id}) => _id);
			}
		}
	}
};
```

Processors and validators are by nature functions and so when including them in the schema,
you **must** always use a "double-function" like below, regardless of whether the processor or the validator is dynamic
or not.

Here's an example. Let's say we add a password field and a processor to our schema to bcrypt the password:

```js
// partial schema
let userSchema = {
	type: 'object',
	shape: {
		profile: {
			password: {
				type: 'string',
				postprocessors: [
					() => async context => context.setData({
						data: await bcrypt.hash(context.getData(), 10)
					})
				]
			}
		}
	}
};
```

If you wish, you can use the first function above to make the postprocessor function dynamic. Here's an example:

Let's say we change the `age` field to a `dob` (date of birth) field. If we want to validate the date of birth to
ensure that the user's age is above a minimum age, we can use a pre or post validator. But what if the age itself comes
from another source such as your database. This is how you would do it:

```js
// partial schema
let userSchema = {
	type: 'object',
	shape: {
		profile: {
			dob: {
				type: 'string',
				format: 'date',
				postvalidators: [
					async () => {
						const
							settings = await API.settings.get(),
							minAge = settings.minimumAge;
						
						// using moment.js library
						return context => {
							
							const
								data = context.getData(),
								birthday = moment(data),
								age = birthday.diff(moment(), 'years');
							
							if(age < minAge) {
								// DO NOT throw errors
								context.addError({
									message: `User must be at least ${minAge}` 
								});
							}
						};
					}
				]
			}
		}
	}
};
```





