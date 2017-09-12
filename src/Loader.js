export default class Loader {

	methods = [];

	register(method) {
		this.methods.push(method);
	}

	deregister(method) {
		this.methods.splice(this.methods.indexOf(method), 1);
	}

	find({name, namespace}) {
		let schema;

		for(const method of methods) {
			schema = method({name, namespace});

			if(schema) {
				break;
			}
		}

		return schema;
	}
}