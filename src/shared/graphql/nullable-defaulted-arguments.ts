import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema, isNonNullType } from 'graphql';

/**
 * The schema with every argument that has a default value nullable again,
 * as `@nestjs/graphql` generated it up to 10.1.6 and so as v1.1.6 serves it.
 *
 * From 10.1.7 on an argument with a default turns non-null, which concerns
 * the `filter`, `paging` and `sorting` arguments the resolver fork
 * generates (MHIRA's own arguments with a default declare `nullable`).
 * Non-null, an explicit `null` would be refused by GraphQL's own argument
 * check instead of reaching the validation pipe, which answers it with
 * BAD_USER_INPUT on v1.1.6. v1.1.6's schema
 * has no non-null argument with a default, so the rule restores exactly
 * that.
 */
export function nullableDefaultedArguments(
    schema: GraphQLSchema,
): GraphQLSchema {
    return mapSchema(schema, {
        [MapperKind.ARGUMENT]: argument =>
            argument.defaultValue !== undefined && isNonNullType(argument.type)
                ? { ...argument, type: argument.type.ofType }
                : argument,
    });
}
