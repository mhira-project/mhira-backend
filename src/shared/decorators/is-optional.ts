import { ValidationOptions, ValidateIf } from 'class-validator';

export function IsOptional(validationOptions?: ValidationOptions) {
    return ValidateIf((_obj, value) => {
        return !!value;
    }, validationOptions);
}
