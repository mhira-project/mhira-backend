import { ValidationOptions, ValidateIf } from 'class-validator';
import { Validator } from '../helpers/validator.helper';

export function IsPhoneNumber(validationOptions?: ValidationOptions) {
    return ValidateIf((_obj, value) => {
        return Validator.isPhone(value);
    }, validationOptions);
}