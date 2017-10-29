# Context
Flexverse's interfaces are mostly immutable. Context is the only mutable object exposed by the library.
When processing or validating data, Flexverse crawls the data top to bottom, recursively.

When a field function gets called, context holds information about the current point in the schema as well as the general
state of data.

## Methods
Only use the methods documented here as use of other methods (meant for internal library use)
could jeopardize the functionality of FlexSchema.

To understand the methods below, let's use this example:

### `isRoot()`
Returns `true` when we are at the root of the data.

### `getCurrentPath()`
Returns the current path

### `getCurrentSchema()`
Returns the current schema

### `getSchemaSnapshot()`
Returns the current [schema snapshot](snapshot.md).

### `getField({name})`
Returns the value of a field in the current schema.

### `getData()`
Returns the current data

### `getOriginalData()`
Returns the current original data 

### `setData({data})`
Set the current data

### `delData()`
Deletes the current data

### `pushData({data})`
If current data is an array, push an item into it.

### `getEntireData()`
Get the entire data

### `getEntireOriginalData()`
Get the entire original data

### `addError(error, options = {})`
Add error

### `hasErrors()`
Does the context have errors?

### `getErrors()`
Get context errors

### `isValid()`
Does the context have any errors?

### `serialize()`
Serialize the current state of the context

## Example Usage of Methods

```js
let partialData = {
	profile: {
		firstName: 'Ashley'
	}
};

let userSchema = FlexSchema.init({
	schema: {
		// root
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
						min: 15,
						postprocessors: [
							() => context => {
								context.getData(); // 15

								// Sets the age to 20
								context.setData({
									data: 20
								});
							}
						],
						if: context => {
							context.isRoot(); // false
							
							context.getCurrentPath(); // path object representing "profile.age"
							
							context.getCurrentSchema();
							/**
							* current schema: {
							*   type: 'number',
							*   numberType: 'integer',
							*   min: 15,
							*   if: () => {}
							* }
							**/
							
							context.getEntireData();
							/**
							* current data: {
							*   profile: {
							*       firstName: 'Ashley',
							*       lastName: '',
							*       age: 0
							*   }
							* }
							*/
							
							context.getEntireOriginalData();
							/**
							* current data: {
							*   profile: {
							*       firstName: 'Ashley'
							*   }
							* }
							*/
							
							return true;
						}
					}
				}
			}
		}
	}
});

let context = userSchema.process({
	data: partialData,
	validate: true
});

context.getSchemaSnapshot();
/**
* current schema snapshot: {
*   type: 'number',
*   numberType: 'integer',
*   min: 15,
*   if: true
* } 
*/

context.isValid(); // false (due to missing lastname and age)
```
