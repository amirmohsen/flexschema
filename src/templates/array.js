export default {
	type: 'array',
	shape: [ // specific shape for children
		{} // schema
	],
	/**
	 * Only use the two below for when all values abide by the same rules
	 * Instead of functions, we can also have
	 * {
	 *  // One of
	 *  values: [
	 *      schema,
	 *      schema,
	 *      schema
	 *  ]
	 *
	 *  or
	 *
	 *  values: schema
	 * }
	 */
	min: 0, // minimum number of items - (Not valid with shape)
	max: 0 // maximum number of items - 0 means infinity. "infinity" and Infinity can also be used. (Not valid with shape)
}