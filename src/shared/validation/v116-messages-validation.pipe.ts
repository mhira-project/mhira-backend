import { ValidationPipe } from '@nestjs/common';
import { PagingStrategies } from '@ptc-org/nestjs-query-graphql';
import { ValidationError } from 'class-validator';

/** class-validator's constraint for a `@ValidateNested` property whose value is neither an object nor an array. */
const NESTED_VALIDATION = 'nestedValidation';

/** class-validator's constraint of `@IsPositive`. */
const IS_POSITIVE = 'isPositive';

/**
 * The error tree as class-validator 0.13 built it for a `@ValidateNested`
 * property whose value is neither an object nor an array: the constraint
 * on a child error of the same property, not on the property's own error.
 */
function withNestedTypeErrorsAsChildren(
    error: ValidationError,
): ValidationError {
    const children = (error.children ?? []).map(withNestedTypeErrorsAsChildren);
    const message = error.constraints?.[NESTED_VALIDATION];
    if (message === undefined) {
        return Object.assign(new ValidationError(), error, { children });
    }
    const { [NESTED_VALIDATION]: _, ...constraints } = error.constraints;
    const child = Object.assign(new ValidationError(), {
        target: error.target?.constructor,
        value: error.value,
        property: error.property,
        constraints: { [NESTED_VALIDATION]: message },
    });
    const asIn013 = Object.assign(new ValidationError(), error, {
        children: [...children, child],
    });
    if (Object.keys(constraints).length > 0) {
        asIn013.constraints = constraints;
    } else {
        delete asIn013.constraints;
    }
    return asIn013;
}

/** Whether the error is about `last` of the resolver library's cursor paging input. */
function isCursorPagingLast(error: ValidationError): boolean {
    const pagingClass = error.target?.constructor as
        | { strategy?: PagingStrategies }
        | undefined;
    return (
        error.property === 'last' &&
        pagingClass?.strategy === PagingStrategies.CURSOR
    );
}

/**
 * The constraints of a cursor paging `last` in the order v1.1.6 gave them:
 * `isPositive` first. The resolver library declares `last` with `@Min(1)`
 * and `@IsPositive()`, applied in the opposite order from its version 9
 * on, so `last: 0` would read "must not be less than 1" first.
 */
function withCursorPagingLastPositiveFirst(
    error: ValidationError,
): ValidationError {
    const children = (error.children ?? []).map(
        withCursorPagingLastPositiveFirst,
    );
    const reordered = Object.assign(new ValidationError(), error, { children });
    const message = error.constraints?.[IS_POSITIVE];
    if (message !== undefined && isCursorPagingLast(error)) {
        reordered.constraints = {
            [IS_POSITIVE]: message,
            ...error.constraints,
        };
    }
    return reordered;
}

/**
 * The global validation pipe, with the messages v1.1.6 gave where a newer
 * library would change them. Each message is built from the error tree, so
 * the pipe gives back the tree v1.1.6 built before it flattens it:
 *
 * - For a `@ValidateNested` value that is neither an object nor an array,
 *   class-validator 0.14 puts the constraint on the property's own error,
 *   where 0.13 put it on a child error of the same property. An explicit
 *   `filter: null` would read "nested property filter must be either
 *   object or array" instead of v1.1.6's "filter.nested property filter
 *   must be either object or array" (and with it, the parent's other
 *   constraints, which the pipe leaves out of a property that has
 *   children, would come back). Ticket 07, step 14.
 * - A cursor paging `last` below 1 lists "must be a positive number"
 *   before "must not be less than 1", as the resolver library did up to
 *   version 2.5. Ticket 07, step 16.
 *
 * No options: any would change what the bare pipe does (`main.ts`).
 * Compatibility measures of ticket 07.
 */
export class V116MessagesValidationPipe extends ValidationPipe {
    protected flattenValidationErrors(
        validationErrors: ValidationError[],
    ): string[] {
        return super.flattenValidationErrors(
            validationErrors
                .map(withNestedTypeErrorsAsChildren)
                .map(withCursorPagingLastPositiveFirst),
        );
    }
}
