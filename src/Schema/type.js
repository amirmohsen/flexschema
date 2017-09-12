export default variable => {
	if(Array.isArray(variable)) {
		return 'array';
	}

	if(variable === null) {
		return 'null'; // TODO: investigate side-effects
	}

	if(typeof variable === 'number') {
		if(Number.isFinite(variable) && !Number.isNaN(variable)) {
			return 'number';
		}
		return 'undefined'; // TODO: investigate side-effects (NaN, Infinity and -Infinity reach here)
	}

	return typeof variable;
};