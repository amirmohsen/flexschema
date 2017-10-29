# Defining Custom Types

To define a custom schema type, you have to extend the `FlexSchema` class.

```js
class CustomType extends FlexSchema {
	
	// If your type has custom fields, make sure you include them here.
	static fields = {
		...FlexSchema.fields, // You must include the built-in default fields
		customField: {
			resolver: () => {} // you must define a resolver for your custom field
		}
	};

	static customValidators = [
		// list of type-specific custom validators (method names on this class)
	];

	static customProcessors = [
		// list of type-specific custom processors (method names on this class)
	];
	
	getEmpty() {
		// return the default "empty" value
		// the default empty value is undefined
	}

	_preprocessSchemaType({schema}) {
		// if you wish to pre-process or pre-validate the schema, use this method.
		// This is useful for adding default fields to the schema as well.
		return schema;
	}

	_validateData(context) {
		// default validation for this type
	}
	
	_processData(context) {
		// default processing for this type
	}
}
```

Then you need to register it:

```js
FlexSchema.registerType({
	name: 'customtype', // this is the name you use for the type field when defining your schema
	value: {
		schema: CustomType
	}
});
```