# FlexSchema
FlexSchema is a highly flexible and dynamic schema library.

**Instability**
Please be warned that this is library is still quite unstable and lacks enough tests. If you do find bugs, please file
issues or even better submit PR fixes.

## Installation
`yarn add flexschema`
or
`npm install flexschema`

## Docs
[Read More](docs/index.md)

## Exports
```js
import {FlexSchema, SchemaSnapshot, type, Error, Loader, Path, SchemaStore, ProcessorStore, Constants} from 'flexschema';
```

## Example
Let's say we want to setup a schema for a user object.

First, we start simple:
```js
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
```

We can do mainly two things with the above schema.

### Process Data

```js
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
```

This outputs:

```json
{
	"profile": {
		"firstName": ""
	}
}
```

The schema processor is used to generate missing fields. The generated data may not pass validation rules but it provides
a "skeleton" data structure useful for redux/react applications.

### Validate Data

```js
context = schema.validate({
	data
});

console.log(context.getErrors());
```

```json
{
	"type": "type",
	"message": "Value must be of type \"object\".",
	"details": {
		"context": {
			"currentPath": {
				"path": [
					"profile"
				]
			}
		}
	}
}
```

### Dynamic fields

All fields can be functions which are evaluated at the processing/validation step.

For instance, say we have a year of birth field that must not allow years beyond the current year:

```js
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
					max: () => (new Date()).getFullYear() // At the time of writing, it's 2017
				}
			}
		}
	}
};
```

Upon validation, you get:

```json
{
	"type": "max",
	"message": "Value must be less than or equal to 2017.",
	"details": {
		"context": {
			"currentPath": {
				"path": [
					"profile",
					"yearOfBirth"
				]
			}
		}
	}
}
```

Dynamic fields can be async functions (useful when the value comes from I/O sources).

FlexSchema is a very powerful schema library and boasts a long list of features. This example only covers some of the basic
features. For a more in-depth understanding of FlexSchema, check out the [documentation](docs/index.md). 