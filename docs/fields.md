# Shared Fields
These fields can be used on all schema types:

Sample:
```js
let schema = {
	type: 'string',
	metadata: {
		random: 'data'
	},
	if: true,
	default: '',
	oneOf: [
		'',
		'one',
		'two',
		'three'
	],
	process: true,
	optional: false,
	nullable: false,
	preprocessors: [
		() => {}
	],
	postprocessors: [
		() => {}
	],
	prevalidators: [
		() => {}
	],
	postvalidators: [
		() => {}
	],
};
```

Any of the fields can be a function that returns the final value.

## type
Sets the type of the schema entry
[Read More](types.md)

## metadata
An object with your own metadata. The metadata contents can be any format and
they are purely for your own purposes.

## if
A boolean indicating whether the entry is used in the schema or not.
It's mostly useful when used as a function that determines that at runtime.

## default
Default value to be used during data processing when no value is available.
Each type has a default "default".

## oneOf
An array of valid values that are allowed. Lodash's "isEqual" is used for equality check.

## process
A boolean indicating whether default processing logic should be executed on the data.

## optional
If value is undefined and "optional" is set to true, validation doesn't generate an error.

## nullable
If set to true, null values are accepted.

## preprocessors
An array of functions to be run on the data for pre-processing (transforming before default processing)

## postprocessors
An array of functions to be run on the data for post-processing (transforming after default processing)

## prevalidators
An array of functions to be run on the data for pre-validating (before default validating)

## postvalidators
An array of functions to be run on the data for post-validating (after default validating)