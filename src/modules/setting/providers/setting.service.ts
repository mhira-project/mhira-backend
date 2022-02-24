import { Injectable } from '@nestjs/common';
import { SettingDto } from '../dtos/setting.dto';
import { UpdateSettingInput } from '../dtos/update-setting.input';
import { Setting } from '../models/setting.model';

@Injectable()
export class SettingService {
    async get(): Promise<SettingDto> {
        const settingsFromDatabase = await Setting.find();
        const settingDto = new SettingDto();

        for (const index in settingsFromDatabase) {
            const key = settingsFromDatabase[index].key;
            const value = settingsFromDatabase[index].value;

            settingDto[key] = value;
        }

        return settingDto;
    }

    async getKey<K extends keyof SettingDto>(key?: K): Promise<SettingDto[K]> {
        const storedSetting = await Setting.findOne({ key });

        const value: SettingDto[K] = storedSetting.value as SettingDto[K];

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
