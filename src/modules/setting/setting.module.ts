import { Module } from '@nestjs/common';
import { SettingService } from './providers/setting.service';
import { SettingResolver } from './resolvers/setting.resolver';

@Module({
    providers: [
        SettingService,
        SettingResolver,
    ],
    exports: [
        SettingService,
    ],
})
export class SettingModule { }
