import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

// A compatibility measure, not a general validator. class-validator 0.12's
// @IsLocale ran validator 13.0.0's isLocale. From class-validator 0.13 it
// runs a later validator whose isLocale follows BCP 47 and accepts tags
// 13.0.0 rejects ("english", "en-GB-oed"), and the other way round. What
// passes is stored as the system locale, so this keeps v1.1.6's check and
// message (ticket 07, decision E; pinned by update-setting.input.spec.ts).
//
// The check is validator 13.0.0's lib/isLocale.js, with class-validator's
// string test in place of its assertString.
// validator.js: Copyright (c) 2018 Chris O'Hara, MIT licence.
const localeReg = /^[A-z]{2,4}([_-]([A-z]{4}|[\d]{3}))?([_-]([A-z]{2}|[\d]{3}))?$/;

function isLocale(value: unknown): boolean {
    if (typeof value !== 'string') {
        return false;
    }
    if (value === 'en_US_POSIX' || value === 'ca_ES_VALENCIA') {
        return true;
    }
    return localeReg.test(value);
}

export function IsLocale(
    validationOptions?: ValidationOptions,
): PropertyDecorator {
    return ValidateBy(
        {
            name: 'isLocale',
            validator: {
                validate: value => isLocale(value),
                defaultMessage: buildMessage(
                    eachPrefix => eachPrefix + '$property must be locale',
                    validationOptions,
                ),
            },
        },
        validationOptions,
    );
}
