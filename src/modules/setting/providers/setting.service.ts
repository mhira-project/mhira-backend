import { Injectable, Logger, NotImplementedException, OnModuleInit } from "@nestjs/common";
import { defaultConfig } from "../config/default-config";
import { SettingDto } from "../dtos/setting.dto";



@Injectable()
export class SettingService {

    async get(): Promise<SettingDto> {

        return defaultConfig;
    }

    async getKey<K extends keyof SettingDto>(key?: K): Promise<SettingDto[K]> {

        return defaultConfig[key]
    }

}
