import Schema from '../../Schema/Schema';
import SchemaSnapshot from '../../Schema/SchemaSnapshot';

export default class ArraySnapshot extends SchemaSnapshot {

	extract({path}) {
		if(path.isEmpty()) {
			return this;
		}

		const
			first = path.first(),
			item = this._fields.shape[first];

		path = path.shift();

		if(!path.isEmpty()) {
			return item.extract({path});
		}

		return item;
	}

	setChild({name, value}) {
		this._fields.shape[name] = value;
		if(this._fields.values instanceof Schema) {
			this._fields.values = value;
		}
	}
}