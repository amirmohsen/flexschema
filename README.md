# FlexSchema
FlexSchema is a highly flexible and dynamic schema library.

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
const userSchema = {
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

const context = schema.process({
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