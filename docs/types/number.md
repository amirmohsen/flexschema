# number
```js
let schema = {
	type: 'number',
	numberType: 'float',
	min: -Infinity,
	max: Infinity,
	inclusiveMin: true,
	inclusiveMax: true
};
```
## numberType
Number type can be one of the following:
- integer
- float
- digit
- fractional

Default: float

## min
The minimum valid value. By default, it's `-Infinity` which means no minimum. `"-Infinity"` string is also valid.

## max
The maximum valid value. By default, it's `Infinity` which means no maximum. `"Infinity"` string is also valid.

## inclusiveMin
If set to false, the minimum is not inclusive. Default: true

## inclusiveMax
If set to false, the maximum is not inclusive. Default: true