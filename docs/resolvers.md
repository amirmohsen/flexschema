# Resolvers
Resolvers are functions that decide which field definition should be used
when multiple definitions are available for a certain field.

Multiple definitions are the result of a situation in which one or more matched resources and/or hardcoded schema values.

In these scenarios, the definitions would have to be merged in some way. Resolvers do just that.

By default, each built-in schema field has its own resolver.

When you create a [custom schema type](custom.md), you must define resolvers for any custom fields it may have.  