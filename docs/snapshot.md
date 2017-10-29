# Schema Snapshot
Flexschema provides extreme dynamism and flexibility. As a result, the exact nature of the schema can be completely
dependent on the data. However, sometimes you may need the schema to have a fixed state. To get such a fixed schema,
you have to first process some data. By processing data, a fixed schema is generated through resolving dynamic fields.
Such a fixed schema is called a schema snapshot.

Here's how you fetch the schema snapshot:

```js
let userSchema = FlexSchema.init({
	schema: {
		type: 'object',
		shape: {
			profile: {
				type: 'object',
				shape: {
					firstName: {
						type: 'string',
						canBeEmpty: false
					},
					lastName: {
						type: 'string',
						canBeEmpty: false
					},
					age: {
						type: 'number',
						numberType: 'integer',
						min: 0
					}
				}
			},
			medical: {
				type: 'object',
				shape: {
					weeklyAlcoholConsumptionUnits: {
						type: 'number',
						numberType: 'integer',
						min: 0,
						if: context => {
							let
								data = context.getEntireData(),
								currentPath = context.getCurrentPath(),
								agePath = currentPath.pop(2).push('profile.age'),
								ageValue = agePath.getData({data});

							return ageValue >= 18;
						}
					}
				}
			}
		}
	}
});

let context = userSchema.process({
	data: {
		profile: {
			firstName: 'Ashley',
			lastName: 'Hunter',
			age: 20
		},
		medical: {
			weeklyAlcoholConsumptionUnits: 2
		}
	}
});

let schemaSnapshot = context.getSchemaSnapshot();
```

## Methods

### extract({path})
Extract a nested snapshot by using a path

### setField({name, value})
Set field value on the snapshot

### setFields({values})
Set all fields on the snapshot

### getField({name})
Get field value

### getFields()
Get all fields

Example usage of methods based on the above example 
```js
let ifValue = schemaSnapshot
	.extract({
		path: new Path({path: 'medical.weeklyAlcoholConsumptionUnits'})
	})
	.getField('if');

// the "ifValue" is true (not the function anymore) since it is now resolved.
```





