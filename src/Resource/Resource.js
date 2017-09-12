import Path from '../Path';
import validate from './validate';
import Constants from '../Constants';
import type from '../Schema/type';

export default class Resource {

	path;
	name;
	condition;
	values;

	constructor({path, name, condition, values}) {
		validate({path, name, condition, values});
		this.path = path ? new Path({path}) : undefined;
		this.name = name;
		this.condition = condition;
		this.values = values;
	}

	match({options, fieldName, fieldSchema, context}) {
		const
			currentPath = context.getCurrentPath(),
			matchedIndices = [];

		if(!this._doNamesMatch({options, fieldSchema, matchedIndices})) {
			return;
		}

		if(!this._doPathsMatch({currentPath})) {
			return;
		}

		return this._getValueUponConditionMet({options, matchedIndices, fieldName, fieldSchema, context});
	}

	_doNamesMatch({options, fieldSchema, matchedIndices}) {
		let
			hasExternalFlag = false,
			areNamesEqual = false,
			hasName = !!this.name;

		if(options.isList && type(fieldSchema) === 'array') {
			for(const [index, entry] of fieldSchema.entries()) {
				if(this.constructor.hasExternalFlag({fieldSchema: entry}) && this.name === entry.name) {
					hasExternalFlag = true;
					areNamesEqual = true;
					matchedIndices.push(index);
				}
			}
		}
		else {
			hasExternalFlag = this.constructor.hasExternalFlag({fieldSchema});
			areNamesEqual = fieldSchema && this.name === fieldSchema.name;
		}

		return (hasExternalFlag && areNamesEqual) || (!hasExternalFlag && !hasName);
	}

	_doPathsMatch({currentPath}) {
		return !this.path || this.path.is({path: currentPath});
	}

	_getValueUponConditionMet({options, matchedIndices, fieldName, fieldSchema, context}) {
		const isConditionMet = this._isConditionMet({context});

		if(isConditionMet instanceof Promise) {
			return isConditionMet.then(isConditionMet => isConditionMet
				? this._getResolvedValue({options, matchedIndices, fieldName, fieldSchema}) : undefined);
		}

		return this._getResolvedValue({options, matchedIndices, fieldName, fieldSchema});
	}

	_isConditionMet({context}) {
		return this.condition === undefined || this.condition === true || this.condition(context);
	}

	_getResolvedValue({options, matchedIndices, fieldName, fieldSchema}) {
		if(this.values && this.values[fieldName]) {
			return this.values[fieldName];
		}
		else if(fieldSchema) {
			if(options.isList && type(fieldSchema) === 'array') {
				return fieldSchema
					.filter((entry, index) => matchedIndices.includes(index) && type(entry.value) !== 'undefined')
					.map(entry => entry.value);
			}
			else if(type(fieldSchema.value) !== 'undefined') {
				return fieldSchema.value;
			}
		}
	}

	static hasExternalFlag({fieldSchema}) {
		return type(fieldSchema) === 'object' && fieldSchema.external === Constants.external && !!fieldSchema.name;
	}
}