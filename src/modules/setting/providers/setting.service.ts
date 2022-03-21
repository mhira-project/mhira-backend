import { Injectable } from '@nestjs/common';
import { SettingDto } from '../dtos/setting.dto';
import { UpdateSettingInput } from '../dtos/update-setting.input';
import { Setting } from '../models/setting.model';
import { defaultConfig } from '../config/default-config';

@Injectable()
export class SettingService {
    async get<K extends keyof SettingDto>(): Promise<SettingDto> {
        const storedSettings = await Setting.find();

        const settingDto = new SettingDto();
        for (const key in defaultConfig) {
            const storedSetting = storedSettings.find(row => row.key === key);

            const value = storedSetting
                ? (storedSetting.value as SettingDto[K])
                : defaultConfig[key];

            settingDto[key] = value;
        }

        return settingDto;
    }

    async getKey<K extends keyof SettingDto>(key?: K): Promise<SettingDto[K]> {
        const storedSetting = await Setting.findOne({ key });

        const value: SettingDto[K] = storedSetting
            ? (storedSetting.value as SettingDto[K])
            : defaultConfig[key];

        return value;
    }

    async update<K extends keyof SettingDto>(
        settingDto: UpdateSettingInput,
    ): Promise<boolean> {
        for (const key in settingDto) {
            const settingKey = key as K;
            const value = settingDto[settingKey];

            if (value !== null) {
                await this.updateKey(settingKey, value);
            }
        }

        return true;
    }

    async updateKey<K extends keyof SettingDto>(
        key: K,
        value: SettingDto[K],
    ): Promise<boolean> {
        const stringValue = value.toString();

        const storedSetting = await Setting.findOne({ key });

        // Update existing setting entry
        if (storedSetting) {
            // Update only if value has changed
            if (storedSetting.value !== stringValue) {
                storedSetting.value = value.toString();
                await storedSetting.save();
            }

            return true;
        }

        // Create new setting entry
        const setting = new Setting();
        setting.key = key;
        setting.value = value.toString();

        await setting.save();

        return true;
    }
}
