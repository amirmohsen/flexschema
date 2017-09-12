import FlexSchemaError from './Error';
import {set, get, del, push} from 'object-path';
import {set as setImmutable, del as delImmutable, push as pushImmutable} from 'object-path-immutable';

export default class Path {

	constructor({path = []} = {path: []}) {
		if(path instanceof Path) {
			return path.clone();
		}

		this.path = this.constructor.normalize({path});
	}

	isRoot() {
		return this.path.length === 0;
	}

	isEmpty() {
		return this.path.length === 0;
	}

	is({path}) {
		if(path instanceof Path) {
			path = path.raw();
		}
		else {
			path = this.constructor.normalize({path});
		}

		return path.join('.') === this.path.join('.');
	}

	first() {
		return this.path[0];
	}

	slice(...args) {
		return new Path({
			path: this.path.slice(...args)
		});
	}

	last() {
		return this.path[this.path.length - 1];
	}

	push(...items) {
		if(items.length < 1) {
			throw new FlexSchemaError({
				message: `Number of items to be added to the path must be at least 1`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					times,
					path: this.path,
					length: this.path.length
				}
			});
		}
		return new Path({
			path: [
				...this.path,
				...items
			]
		});
	}

	pop(times = 1) {
		if(times < 1 || times > this.path.length) {
			throw new FlexSchemaError({
				message: `"times" arguments must be at least 1 and no more than the length of the path`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					times,
					path: this.path,
					length: this.path.length
				}
			});
		}
		return new Path({
			path: this.path.slice(0, - times)
		});
	}

	shift(times = 1) {
		if(times < 1 || times > this.path.length) {
			throw new FlexSchemaError({
				message: `"times" arguments must be at least 1 and no more than the length of the path`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					times,
					path: this.path,
					length: this.path.length
				}
			});
		}
		return new Path({
			path: this.path.slice(times)
		});
	}

	length() {
		return this.path.length;
	}

	/**
	 * @deprecated
	 */
	raw() {
		return this.path.slice();
	}

	getData({data}) {
		if(this.isRoot()) {
			return data;
		}

		return get(data, this.path);
	}

	setData({data, newData, immutable = false}) {
		if(this.isRoot()) {
			return newData;
		}

		if(immutable) {
			return setImmutable(data, this.path, newData);
		}

		set(data, this.path, newData);

		return data;
	}

	delData({data, immutable = false}) {
		if(this.isRoot()) {
			return undefined;
		}

		if(immutable) {
			return delImmutable(data, this.path);
		}

		del(data, this.path);

		return data;
	}

	pushData({data, newData, immutable = false}) {
		if(this.isRoot()) {
			if(!Array.isArray(data)) {
				data = [];
			}

			if(immutable) {
				data = [
					...data,
					newData
				];
			}
			else {
				data.push(newData);
			}

			return data;
		}

		if(immutable) {
			return pushImmutable(data, this.path, newData);
		}

		push(data, this.path, newData);

		return data;
	}

	clone() {
		return new Path({path: this.path.slice()});
	}

	toString() {
		return this.path.join('.');
	}

	toArray() {
		return this.path.slice();
	}

	static normalize({path}) {
		this.validate({path});
		return this._resolve({path});
	}

	static validate({path}) {
		if(Array.isArray(path)) {
			for(const item of path) {
				if(typeof item !== 'string' && !Number.isInteger(item) && (Number.isInteger(item) && item < 0)) {
					throw new FlexSchemaError({
						message: `Path array items must be strings or numbers`,
						code: FlexSchemaError.CODES.BAD_SCHEMA,
						details: {
							path
						}
					});
				}
			}
		}
		else if(typeof path !== 'string' || !path) {
			throw new FlexSchemaError({
				message: `Path must be either a non-empty dot-separated string or an array of strings and/or 0+ integers`,
				code: FlexSchemaError.CODES.BAD_SCHEMA,
				details: {
					path
				}
			});
		}
	}

	static _resolve({path}) {
		if(!Array.isArray(path)) {
			path = path.split('.');
		}
		return path;
	}
}