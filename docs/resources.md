# Resources

## Purpose

Sometimes, you may need to add fields to your schema after you have defined it.
Other times, you may need to define fields on your schema but only enable them if certain conditions are met.

## Usage
You specify resources as an array. These can be specified either at registration time or initialization time:

```js
FlexSchema.register({
	namespace: 'test',
	name: 'test',
	schema: testSchema,
	resources: [] // list of resources to be associated with this schema
});

// and/or

FlexSchema.init({
	namespace: 'test',
	name: 'test',
	resources: [] // list of resources to be associated with this schema
});

// if you add resources at both registration and initialization time, they will get merged before being used.
```

## Definition
Resource definitions have two parts; one part belongs inside the `resources` array and the second part in the schema
definition. The two parts must have matching criteria for the relevant field to be used.

**First part**
```js
FlexSchema.init({
	namespace: 'test',
	name: 'test',
	resources: [
		{
			name: '', // name (if provided) must match to be used
			condition: () => {}, // condition (if provided - either boolean or function that returns boolean) must be true to be used
			path: '', // path (if provided) must match to be used
			values: {
				// provide field values here.
				fieldName: fieldValue
				// alternatively, instead of providing values here, you can define it in the schema
			}
		}
	]
});
```

**Second part**
```js
let schema = {
	type: '...',
	fieldName: {
		name: '', // name (if provided) must match to be used,
		condition: () => {}, // condition (if provided - either boolean or function that returns boolean) must be true to be used
		value: '', // you can either define the value here or above (not both)
		external: Constants.external // This constant is required for a resource-based field to work.
	}
};
```
## Example
Example might help explain the usage of resources better:

We define a password schema and a postprocessor for bcrypting the value.

```js
let schema = FlexSchema.init({
	schema: {
		type: 'string',
		postprocessors: [
			{
				name: 'preSave',
				value: async context => {
					context.setData({
						data: await bcrypt.hash(context.getData(), 10)
					});
				},
				external: Constants.external
			}
		]
	}
});
```

We don't want the postprocessor to run every time we process our data so we have defined it as a resource.

This means it only runs when the name is provided while processing.
You can be more specific by providing a condition and/or path.

```js
schema.process({
	data,
	resources: [
		{
			name: 'preSave'
		}
	]
});
```

If you wish to add a resource at every schema level, you can set the condition to `true`.
For instance, this is useful for adding metadata to every field:

```js
schema.process({
	resources: [
		{
			name: 'preSave'
		},
		{
			condition: true, // applies at every schema level
			values: {
				metadata
			}
		}
	]
});
```

