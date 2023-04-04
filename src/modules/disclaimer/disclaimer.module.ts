import { Module } from '@nestjs/common';
import { DisclaimerService } from './providers/disclaimer.service';
import { DisclaimerResolver } from './resolvers/disclaimer.resolver';

@Module({
    providers: [DisclaimerService, DisclaimerResolver],
    exports: [DisclaimerService],
})
export class DisclaimerModule {}
