export const schema = {
	type: 'object',
	shape: {
		profile: {
			type: 'object',
			shape: {
				firstName: {
					type: 'string',
					min: 1,
					max: 100
				},
				middleName: {
					type: 'string',
					max: 100,
					optional: true
				},
				lastName: {
					type: 'string',
					min: 1,
					max: 100
				},
				email: {
					type: 'string',
					format: 'email',
					min: 1,
					max: 100
				},
				password: {
					type: 'string',
					min: 8,
					max: 30
				},
				dob: {
					type: 'number',
					numberType: 'integer',
					min: 1850,
					optional: true
				}
			}
		},
		permissions: {
			type: 'array',
			values: {
				type: 'string'
			}
		},
		roles: {
			type: 'array',
			values: {
				type: 'string',
				format: 'objectid'
			}
		}
	}
};

export const validData = {
	profile: {
		firstName: 'Ashley',
		middleName: '',
		lastName: 'Hunter',
		email: 'ashley@example.com',
		password: 'test123!',
		dob: 1992
	},
	permissions: [
		'user.read',
		'user.create',
		'user.edit',
		'user.delete'
	],
	roles: [
		'5908d47c96af92b0bc31b93b',
		'5908d4e696af92b0bc31b93c'
	]
};