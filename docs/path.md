# Path
Path object wraps around an array which contains the path to some data

## constructor
The constructor accepts either an array or a dot-separated string.

```js
let path = new Path({
	path: 'profile.firstName'
});

let path2 = new Path(); // same as empty array which means root level

let path3 = new Path({
	path: ['profile', 'firstName']
});
```

## Methods

### `isRoot()`
Does the path represent the top level of the object?

### `isEmpty()`
Is the path empty? This is an alias for the `isRoot()`. 

### `is({path})`
Is the path the same as the provided one?

```js
let path = new Path({
	path: 'profile.firstName'
});

let path2 = new Path();

let path3 = new Path({
	path: ['profile', 'firstName']
});

path.is({path: path2}); // false

path.is({path: path3}); // true

path2.is({path: ['roles']}); // false

path3.is({path: 'profile.firstName'}); // true
```

### `first()`
Get the first part of the path

```js
let path = new Path({
	path: 'seasons.0.episodes.5.cast.4.name'
});

path.first(); // 'seasons'
```

### `slice(startIndex, length)`
Create a new path from the old one based on the arguments.
This runs `slice` on the underlying array.

```js
let path = new Path({
	path: 'seasons.0.episodes.5.cast.4.name'
});

path.slice(2); // 'episodes.5.cast.4.name'
```

### `last()`
Get the last part of the path

```js
let path = new Path({
	path: 'seasons.0.episodes.5.cast.4.name'
});

path.last(); // 'name'
```

### `push(...items)`
Create a new path with the added items. The old path remains the same.

```js
let path = new Path({
	path: 'seasons.0.episodes.5'
});

let newPath = path.push('cast', 4, 'name'); // 'seasons.0.episodes.5.cast.4.name'
```

### `pop(times = 1)`
Create a new path with the specified number of items removed from the end. The old path remains the same.

```js
let path = new Path({
	path: 'seasons.0.episodes.5.cast.4.name'
});

let newPath = path.pop(3); // seasons.0.episodes.5
```

### `shift()`
Create a new path with the specified number of items removed from the beginning. The old path remains the same.

```js
let path = new Path({
	path: 'seasons.0.episodes.5.cast.4.name'
});

let newPath = path.shift(4); // cast.4.name
```

### `length()`
Length of the underlying array

```js
let path = new Path({
	path: 'seasons.0.episodes.5.cast.4.name'
});

path.length(); // 7
```

### `getData({data)`
Extract a piece of nested data from the argument

```js
let data = {
	title: 'Stranger Things',
	seasons: [
		{
			title: 'Season 1',
			episodes: [
				{
					title: 'Chapter One: The Vanishing of Will Byers'
				},
				{
					title: 'Chapter Two: The Weirdo on Maple Street'
				}
			]
		}
	]
};

let path = new Path({
	path: 'seasons.0.episodes.1.title'
});

path.getData({data}); // 'Chapter Two: The Weirdo on Maple Street'
```

### `setData({data, newData, immutable = false})`
Inject data at this path. If you set immutable, it creates a new data structure without mutating the original

```js
let data = {
	title: 'Stranger Things',
	seasons: [
		{
			title: 'Season 1',
			episodes: [
				{
					title: 'Chapter One: The Vanishing of Will Byers'
				},
				{
					title: 'Chapter Two: The Weirdo on Maple Street'
				}
			]
		}
	]
};

let path = new Path({
	path: 'seasons.0.episodes.2.title'
});

let newData = path.getData({data, newData: 'Chapter Three: Holly, Jolly', immutable: true});

/**
* {
*	title: 'Stranger Things',
*	seasons: [
*		{
*			title: 'Season 1',
*			episodes: [
*				{
*					title: 'Chapter One: The Vanishing of Will Byers'
*				},
*				{
*					title: 'Chapter Two: The Weirdo on Maple Street'
*				},
*		    	{
*					title: 'Chapter Three: Holly, Jolly'
*				}
*			]
*		}
*	]
* }
*/
```

### `delData({data, immutable = false})`
Deletes data at the path

### `pushData({data, newData, immutable = false})`
Pushes data at the path (only for arrays)

### `clone()`
Creates a copy of the path object

### `toString()`
Returns the string representation (dot-separated) of the path object.

### `toArray()`
Returns a copy of the internal array
