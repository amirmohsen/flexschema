# string
```js
let schema = {
	type: 'string',
	min: 0,
	max: Infinity,
	format: '',
	canBeEmpty: true
};
```
## min
Minimum number of characters (default: 0)

## max
Maximum number of characters (default: Infinity). Instead of the `Infinity` constant, you can use the `"infinity"` string.

## format
By default, it's an empty string which means the value doesn't have to abide by any specific format.
The built-in formats are the following:

- int
- float
- number
- objectid
- datetime (ISO8601)
- email 