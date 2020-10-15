import { Injectable, Logger, NotImplementedException, OnModuleInit } from "@nestjs/common";
import { defaultConfig } from "../config/default-config";
import { SettingDto } from "../dtos/setting.dto";



@Injectable()
export class SettingService {

    async get(): Promise<SettingDto> {

        return defaultConfig;
    }

}
