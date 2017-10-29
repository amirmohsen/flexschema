# Usage

## Registration and Initialization
Once you have your schema ready, you need to initialize it before you use it.

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

There are two ways to do this.

### 1

Register the schema:

```js
FlexSchema.register({
	namespace: 'example',
	name: 'user',
	schema: userSchema
});
```
Then initialize it using its name and namespace:

```js
let schema = FlexSchema.init({
	namespace: 'example',
	name: 'user'
});
```

### 2

Use it without registration:

```js
let schema = FlexSchema.init({
	schema: userSchema
});
```

## Purpose of Registration

Registration is useful for schema re-use as well as referencing a registered schema in other schemas.

## Purpose of namespaces

Namespaces are good for organizing schemas.