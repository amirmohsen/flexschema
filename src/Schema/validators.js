import isEqual from 'lodash/isEqual';
import stringify from 'json-stringify-safe';

export const validateOneOf = ({oneOf, data, context}) => {
	let validated = true;

	if(oneOf.length) {
		validated = false;

		for(const possibleValue of oneOf) {
			if(isEqual(data, possibleValue)) {
				validated = true;
			}
		}
	}

	if(!validated) {
		context.addError({
			type: 'oneOf',
			message: `Value must match one of following: ${oneOf.map(possibleValue => `"${stringify(possibleValue)}"`).join(', ')}`
		})
	}
};