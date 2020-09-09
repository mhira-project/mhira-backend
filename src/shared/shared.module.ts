import { Module } from '@nestjs/common';
import { SmsModule } from './sms/sms.module';
import { PaginationModule } from './pagination/pagination.module';

@Module({
    imports: [
        SmsModule,
        PaginationModule,
    ],
    exports: [
        SmsModule,
        PaginationModule,
    ]
})
export class SharedModule { }
