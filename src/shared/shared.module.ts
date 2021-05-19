import { Module } from '@nestjs/common';
import { SmsModule } from './sms/sms.module';
import { PaginationModule } from './pagination/pagination.module';
import { CacheModule } from './cache/cache.module';

@Module({
    imports: [
        SmsModule,
        PaginationModule,
        CacheModule,
    ],
    exports: [
        SmsModule,
        PaginationModule,
    ]
})
export class SharedModule { }
