export default {
	type: 'string',
	min: 0, // Minimum length
	max: 0, // Maximum length - 0 means infinity. "infinity" and Infinity can also be used.
	format: '', // One of: int, float, number, ObjectId, datetime (ISO 8601), date, time
	canBeEmpty: true //
};