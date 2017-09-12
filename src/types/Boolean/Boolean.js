import Schema from '../../Schema/Schema';

export default class BooleanSchema extends Schema {

	getEmpty() {
		return false;
	}
}