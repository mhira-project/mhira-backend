import { Module } from '@nestjs/common';
import { ConsentService } from './providers/consent.service';
import { ConsentResolver } from './resolvers/consent.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consent } from './models/consent.model';

@Module({
    imports: [TypeOrmModule.forFeature([Consent])],
    providers: [ConsentService, ConsentResolver],
    exports: [ConsentService],
})
export class ConsentModule { }
