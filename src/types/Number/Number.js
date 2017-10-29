import Schema from '../../Schema/Schema';
import SchemaPreProcessor from '../../Schema/SchemaPreProcessor';

export default class NumberSchema extends Schema {

	static fields = {
		...Schema.fields,
		'numberType': {},
		'min': {},
		'max': {},
		'inclusiveMin': {},
		'inclusiveMax': {}
	};

	getEmpty(context) {
		if(context) {
			const min = context.getField({name: 'min'});

			if(min instanceof Promise) {
				return min.then(min => {
					if(Number.isFinite(min)) {
						return min;
					}

					return 0;
				});
			}

			if(Number.isFinite(min)) {
				return min;
			}
		}

		return 0;
	}

	_preprocessSchemaType({schema}) {
		return SchemaPreProcessor
			.schema(schema)
			.structure({
				inclusiveMin: {
					default: true,
					type: 'boolean'
				},
				inclusiveMax: {
					default: true,
					type: 'boolean'
				},
				min: {
					default: -Infinity,
					types: ['number', 'infinity', '-infinity']
				},
				max: {
					default: Infinity,
					types: ['number', 'infinity', '-infinity'],
					validator: () => schema.min < schema.max
				},
				numberType: {
					default: 'float',
					type: 'string',
					oneOf: [
						'integer',
						'float',
						'digit',
						'fractional'
					]
				}
			})
			.preprocess();
	}

	_validateData(context) {
		const
			data = context.getOriginalData(),
			inclusiveMin = context.getField({name: 'inclusiveMin'}),
			inclusiveMax = context.getField({name: 'inclusiveMax'}),
			min = context.getField({name: 'min'}),
			max = context.getField({name: 'max'});

		if((min > data && inclusiveMin) || (min >= data && !inclusiveMin)) {
			context.addError({
				type: 'min',
				message: `Value must be greater than${inclusiveMin ? ' or equal to' : ''} ${min}.`
			});
		}

		if((max < data && inclusiveMin) || (max <= data && !inclusiveMin)) {
			context.addError({
				type: 'max',
				message: `Value must be less than${inclusiveMax ? ' or equal to' : ''} ${max}.`
			});
		}

		let
			numberType = context.getField({name: 'numberType'}),
			numberTypeMatched = true;

		switch(numberType) {
			case 'integer':
				if(!Number.isInteger(data)) {
					numberTypeMatched = false;
				}
				break;
			case 'float':
				if(typeof data !== 'number' || !Number.isFinite(data)) {
					numberTypeMatched = false;
				}
				break;
			case 'digit':
				if(!Number.isInteger(data) || data < 0 || data > 9) {
					numberTypeMatched = false;
				}
				break;
			case 'fractional':
				if(typeof data !== 'number' || !Number.isFinite(data) || !Math.floor(data) !== data) {
					numberTypeMatched = false;
				}
				break;
		}

		if(!numberTypeMatched) {
			context.addError({
				type: 'numberType',
				message: `Value must be of type "${numberType}".`
			});
		}
	}
}