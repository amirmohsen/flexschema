# `FlexSchema` Top-Level API

## Static Methods

### `init({namespace, name, schema, resources = []})`
[Initializes a schema object.](usage.md)

You must either provide name & namespace or schema but not both. [Resources](resources.md) is optional.

### `register({namespace, name, schema, resources = []})`
Registers a schema. [Resources](resources.md) is optional

### `registerType({name, value})`
Registers a [custom type](custom.md).

## Methods

### `process({data, resources = [], validate = false})`
Process data. [Resources](resources.md) is optional.
By setting `validate` to true, you can process and validate simultaneously.

### `validate({data, resources = []})`
Validate data. [Resources](resources.md) is optional.

### `assert()`
Same as `validate` but it throws a `FlexSchemaError` if any errors are found. 

