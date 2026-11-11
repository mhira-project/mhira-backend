import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/** class-validator's constraint for a `@ValidateNested` property whose value is neither an object nor an array. */
const NESTED_VALIDATION = 'nestedValidation';

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

/**
 * The global validation pipe, with the messages v1.1.6 gave for a
 * `@ValidateNested` value that is neither an object nor an array.
 *
 * class-validator 0.14 puts that constraint on the property's own error,
 * where 0.13 put it on a child error of the same property. The pipe builds
 * each message from the path of the error that carries it, so an explicit
 * `filter: null` would read "nested property filter must be either object
 * or array" instead of v1.1.6's "filter.nested property filter must be
 * either object or array" (and with it, the parent's other constraints,
 * which the pipe leaves out of a property that has children, would come
 * back). This gives the pipe 0.13's tree before it flattens it. No options:
 * any would change what the bare pipe does (`main.ts`). A compatibility
 * measure of ticket 07 (step 14).
 */
export class NestedMessagesValidationPipe extends ValidationPipe {
    protected flattenValidationErrors(
        validationErrors: ValidationError[],
    ): string[] {
        return super.flattenValidationErrors(
            validationErrors.map(withNestedTypeErrorsAsChildren),
        );
    }
}
