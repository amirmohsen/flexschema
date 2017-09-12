export default {
	type: 'number',
	min: 0, // Minimum
	max: 0, // Maximum - 0 means infinity. "infinity" and Infinity can also be used.
	numberType: ''
	/**
	 * One of
	 * 'integer',
	 * 'float',
	 * 'digit',
	 * 'natural',
	 * 'whole',
	 * 'real',
	 * 'fractional'
	 */
	// Allow for new numberTypes to be registered
	// (global, per schema, per use of schema)
};