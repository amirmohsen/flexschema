# References
[Arrays](types/array.md) and [objects](types/object.md) can use references as their children to reference other schemas.
This is good for re-usability, composability and encapsulation.

References can work with both `shape` and `values` fields.

## Example

### Cast
```js
let castSchema = {
	type: 'object',
	shape: {
		name: {
			type: 'string'
		},
		character: {
			type: 'string'
		}
	}
};

FlexSchema.register({
	namespace: 'example',
	name: 'cast',
	schema: castSchema
});
```

### TV Show
```js
let tvShowSchema = {
	type: 'object',
	shape: {
		title: {
			type: 'string'
		},
		seasons: {
			type: 'array',
			values: {
				// etc
			}
		},
		cast: {
			type: 'array',
			values: {
				type: 'object',
				shape: {
					namespace: 'example',
					name: 'cast'
				}
			}
		}
	}
};

FlexSchema.register({
	namespace: 'example',
	name: 'tvShow',
	schema: tvShowSchema
});
```

### Movies
```js
let movieSchema = {
	type: 'object',
	shape: {
		title: {
			type: 'string'
		},
		cast: {
			type: 'array',
			values: {
				type: 'object',
				shape: {
					namespace: 'example',
					name: 'cast'
				}
			}
		}
	}
};

FlexSchema.register({
	namespace: 'example',
	name: 'movie',
	schema: tvShowSchema
});
```