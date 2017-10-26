# Format
Schema entries are objects with a `type` field:

```js
let schema = {
	type: '...'
};
```

Each schema type represents a different type of data.

As well as the `type` field, schemas can have other fields; some of these fields are shared among types
while others are specific to a type.