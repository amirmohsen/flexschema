// All functions are loaded at registration time
export default {
	if: true,
	default: '', // value different based on schema or function for dynamic
	preprocessors: () => {}, // data preprocessor (runs before processor)
	postprocessors: () => {}, // data postprocessor (runs after processor)
	prevalidators: () => {},
	postvalidators: () => {},
	oneOf: [], // any of specified values (using lodash's isEqual) or function to get a dynamic list
	process: true, // if false, it skips built-in processing and goes straight to validator (can also be set at global, per-type, schema-level or schema usage-level)
	optional: false, // If no data, it doesn't try to fill it or validate it
	nullable: false, // Is null acceptable as a value?
	metadata: {}
}