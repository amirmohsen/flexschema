# object
```js
let schema = {
	type: 'object',
	shape: {},
	keys: {
		type: 'string'
	},
	values: {
		type: ''
	},
	min: 0,
	max: Infinity
};
```
Object schemas can take two forms. They can be either shape-based or key/value-based (not both).

## shape
If your object has a specific shape, you can define it like this: 
```js
let schema = {
	type: 'object',
	shape: {
		firstName: {
			type: 'string'
		},
		lastName: {
			type: 'string'
		}
	}
};

let validData = {
	firstName: 'Ashley',
	lastName: 'Hunter'
};
```

The `min` and `max` fields are not to be used in conjunction with `shape`.

## values
If your object has keys and/or values of a specific type, you can define it like this:
When using `values` to define your object schema, `keys` schema is optional. 

```js
let schema = {
	type: 'object',
	keys: {
		type: 'string',
		format: 'objectid'
	},
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

let validData = {
	'59f3b519f7ca578b2a1d4e9c': {
		firstName: 'Ashley',
		lastName: 'Hunter'
	},
	'59f3b51ae43e63ad78508fbd': {
		firstName: 'John',
		lastName: 'Williams'
	},
	'59f3b51dc45297be77b66ed9': {
		firstName: 'Ali',
		lastName: 'Mann'
	}
};
```

## min
Minimum number of entries in the object. Default: 0

## max
Maximum number of entries in the object. Default: `Infinity`. `"Infinity"` string is also valid.