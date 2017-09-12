export default {
	type: 'object',
	shape: { // specific shape for children
		key: {} // name => schema
	},
	/**
	 * or
	 */
	keys: {}, // optional
	values: {},
	min: 0, // minimum number of keys - (Not valid with shape)
	max: 0 // maximum number of keys - 0 means infinity. "infinity" and Infinity can also be used. (Not valid with shape)
}