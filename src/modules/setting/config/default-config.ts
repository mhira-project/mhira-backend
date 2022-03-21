import { SettingDto } from '../dtos/setting.dto';

export const defaultConfig: SettingDto = {
    systemLocale: 'en',
    systemTimezone: 'Africa/Dar_es_Salaam',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'LT',
    dateTimeFormat: 'YYYY-MM-DD LT',
    passwordLifeTimeInDays: 365,
    passwordReUseCutoffInDays: 365,
    maxLoginAttempts: 5,
};
