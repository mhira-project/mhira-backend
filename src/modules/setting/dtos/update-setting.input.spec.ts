import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateSettingInput } from './update-setting.input';

// What `updateSettings` accepts as `systemLocale` is what gets stored in
// the settings. v1.1.6 validates it with validator 13.0.0's isLocale;
// class-validator 0.13 brings a validator that accepts more (ticket 07,
// decision E). These are v1.1.6's answers, and they must not change.

// validator 13.0.0's own test fixtures for isLocale.
const VALIDATOR_VALID = [
    'uz_Latn_UZ',
    'en',
    'gsw',
    'es_ES',
    'sw_KE',
    'am_ET',
    'ca_ES_VALENCIA',
    'en_US_POSIX',
];
const VALIDATOR_INVALID = ['lo_POP', '12', '12_DD'];

// The locales the frontend's settings page offers: moment 2.29.1's
// `moment.locales()`. v1.1.6 rejects two of them (BUGS.md, B54).
const FRONTEND_REJECTED = ['oc-lnc', 'x-pseudo'];
const FRONTEND_ACCEPTED = [
    'en',
    'af',
    'ar-dz',
    'ar-kw',
    'ar-ly',
    'ar-ma',
    'ar-sa',
    'ar-tn',
    'ar',
    'az',
    'be',
    'bg',
    'bm',
    'bn-bd',
    'bn',
    'bo',
    'br',
    'bs',
    'ca',
    'cs',
    'cv',
    'cy',
    'da',
    'de-at',
    'de-ch',
    'de',
    'dv',
    'el',
    'en-au',
    'en-ca',
    'en-gb',
    'en-ie',
    'en-il',
    'en-in',
    'en-nz',
    'en-sg',
    'eo',
    'es-do',
    'es-mx',
    'es-us',
    'es',
    'et',
    'eu',
    'fa',
    'fi',
    'fil',
    'fo',
    'fr-ca',
    'fr-ch',
    'fr',
    'fy',
    'ga',
    'gd',
    'gl',
    'gom-deva',
    'gom-latn',
    'gu',
    'he',
    'hi',
    'hr',
    'hu',
    'hy-am',
    'id',
    'is',
    'it-ch',
    'it',
    'ja',
    'jv',
    'ka',
    'kk',
    'km',
    'kn',
    'ko',
    'ku',
    'ky',
    'lb',
    'lo',
    'lt',
    'lv',
    'me',
    'mi',
    'mk',
    'ml',
    'mn',
    'mr',
    'ms-my',
    'ms',
    'mt',
    'my',
    'nb',
    'ne',
    'nl-be',
    'nl',
    'nn',
    'pa-in',
    'pl',
    'pt-br',
    'pt',
    'ro',
    'ru',
    'sd',
    'se',
    'si',
    'sk',
    'sl',
    'sq',
    'sr-cyrl',
    'sr',
    'ss',
    'sv',
    'sw',
    'ta',
    'te',
    'tet',
    'tg',
    'th',
    'tk',
    'tl-ph',
    'tlh',
    'tr',
    'tzl',
    'tzm-latn',
    'tzm',
    'ug-cn',
    'uk',
    'ur',
    'uz-latn',
    'uz',
    'vi',
    'yo',
    'zh-cn',
    'zh-hk',
    'zh-mo',
    'zh-tw',
];

// Language tags validator 13.0.0 rejects and later versions accept.
const LATER_VALIDATOR_ACCEPTS = [
    'english',
    'en-GB-oed',
    'de-CH-1996',
    'i-klingon',
    'x-private',
    'abcde',
    'abcdefgh',
    'en-US-u-ca-gregory',
    'ja-JP-x-kana',
];

// 13.0.0's pattern reads [A-z], which spans the characters between "Z"
// and "a", so it accepts a backslash in a subtag. Later versions do not.
const ONLY_VALIDATOR_13_0_ACCEPTS = ['en_\\_US'];

const REJECTED = {
    statusCode: 400,
    message: ['systemLocale must be locale'],
    error: 'Bad Request',
};

// main.ts's global pipe, bare, applied to the mutation's argument.
async function validate(input: object): Promise<unknown> {
    try {
        await new ValidationPipe().transform(input, {
            type: 'body',
            metatype: UpdateSettingInput,
        });
        return 'accepted';
    } catch (error) {
        if (!(error instanceof BadRequestException)) throw error;
        return error.getResponse();
    }
}

describe('UpdateSettingInput.systemLocale', () => {
    it.each([
        ...VALIDATOR_VALID,
        ...FRONTEND_ACCEPTED,
        ...ONLY_VALIDATOR_13_0_ACCEPTS,
    ])('accepts %p', async locale => {
        expect(await validate({ systemLocale: locale })).toBe('accepted');
    });

    it.each([
        ...VALIDATOR_INVALID,
        ...FRONTEND_REJECTED,
        ...LATER_VALIDATOR_ACCEPTS,
    ])('rejects %p', async locale => {
        expect(await validate({ systemLocale: locale })).toEqual(REJECTED);
    });

    // The shared IsOptional skips every falsy value.
    it.each([
        ['missing', {}],
        ['null', { systemLocale: null }],
        ['the empty string', { systemLocale: '' }],
        ['zero', { systemLocale: 0 }],
        ['false', { systemLocale: false }],
    ])('skips the check when the value is %s', async (_label, input) => {
        expect(await validate(input)).toBe('accepted');
    });

    it.each([
        ['a number', 5],
        ['true', true],
        ['an array', ['en']],
        ['an object', { locale: 'en' }],
    ])('rejects %s', async (_label, value) => {
        expect(await validate({ systemLocale: value })).toEqual(REJECTED);
    });
});
