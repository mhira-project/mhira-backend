
import { ValidationOptions, ValidateIf } from 'class-validator';

export function IsOptional(validationOptions?: ValidationOptions) {
    return ValidateIf((obj, value) => {
        const isValid = value !== null && value !== undefined && value !== '';

        return !!isValid;
    }, validationOptions);
}
