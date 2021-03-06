import SchemaPreProcessor from '../../Schema/SchemaPreProcessor';
import Schema from '../../Schema/Schema';
import validator from 'validator';

export default class StringSchema extends Schema {

	static fields = {
		...Schema.fields,
		'min': {},
		'max': {},
		'format': {},
		'canBeEmpty': {}
	};

	getEmpty() {
		return '';
	}

	_preprocessSchemaType({schema}) {
		return SchemaPreProcessor
			.schema(schema)
			.structure({
				min: {
					default: 0,
					type: 'number',
					validator: () => Number.isInteger(schema.min) && schema.min > 0
				},
				max: {
					default: Infinity,
					types: ['number', 'infinity'],
					validator: () => (Number.isFinite(schema.max) || Number.isInteger(schema.max)) && schema.min < schema.max
				},
				format: {
					default: '',
					type: 'string',
					oneOf: [
						'',
						'int',
						'float',
						'number',
						'objectid',
						'datetime',
						'email'
					]
				},
				canBeEmpty: {
					default: true,
					type: 'boolean'
				}
			})
			.preprocess();
	}

	_validateData(context) {
		const
			data = context.getData(),
			length = data.length, // TODO: only allow utf-8 encoding and make sure length accounts for multi-byte characters
			canBeEmpty = context.getField({name: 'canBeEmpty'}),
			min = context.getField({name: 'min'}),
			max = context.getField({name: 'max'});

		// TODO: implement word count

		if(!canBeEmpty && !length) {
			context.addError({
				type: 'canBeEmpty',
				message: 'Value must not be empty.'
			});
		}

		if(min > length) {
			context.addError({
				type: 'min',
				message: `Value must be at least ${min} characters long.`
			});
		}

		if(max < length) {
			context.addError({
				type: 'max',
				message: `Value must be at least ${max} characters long.`
			});
		}

		let
			format = context.getField({name: 'format'}),
			formatMatched = true;

		switch(format) {
			case 'int':
				if(!validator.isInt(data)) {
					formatMatched = false;
				}
				break;
			case 'float':
				if(!validator.isFloat(data)) {
					formatMatched = false;
				}
				break;
			case 'number':
				if(!validator.isNumeric(data)) {
					formatMatched = false;
				}
				break;
			case 'objectid':
				if(!validator.isMongoId(data)) {
					formatMatched = false;
				}
				break;
			case 'datetime':
				if(!validator.isISO8601(data)) {
					formatMatched = false;
				}
				break;
			case 'email':
				if(!validator.isEmail(data)) {
					formatMatched = false;
				}
				break;
		}

		if(!formatMatched) {
			context.addError({
				type: 'format',
				message: `Value must be formatted as "${format}".`
			});
		}
	}
}