# array
```js
let schema = {
	type: 'array',
	shape: [],
	values: {
		type: ''
	},
	min: 0,
	max: Infinity
};
```
Array schemas can take two forms. They can be either shape-based or values-based (not both).

## shape
If your array has a specific shape, you can define it like this: 
```js
let schema = {
	type: 'array',
	shape: [
		{
			type: 'string'
		},
		{
			type: 'number'
		},
		{
			type: 'boolean'
		}
	]
};

let validData = [
	'test',
	1,
	false
];
```

The `min` and `max` fields are not to be used in conjunction with `shape`.

## values
If your array has values of a specific type, you can define it like this:

```js
let schema = {
	type: 'array',
	values: {
		type: 'object',
		shape: {
			firstName: {
				type: 'string'
			},
			lastName: {
				type: 'string'
			}
		}
	}
};

let validData = [
	{
		firstName: 'Ashley',
		lastName: 'Hunter'
	},
	{
		firstName: 'John',
		lastName: 'Williams'
	},
	{
		firstName: 'Ali',
		lastName: 'Mann'
	} 
];
```

## min
Minimum number of entries in the array. Default: 0

## max
Maximum number of entries in the array. Default: `Infinity`. `"Infinity"` string is also valid.