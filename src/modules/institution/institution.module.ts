import { Module } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { InstitutionRepository } from './institution.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstitutionResolver } from './institution.resolver';
import { InstitutionLoader } from './dataloaders/institution.loader';

@Module({
    imports: [TypeOrmModule.forFeature([InstitutionRepository])],
    providers: [
        InstitutionService,
        InstitutionResolver,
        InstitutionLoader,
    ],
    exports: [
        InstitutionLoader,
    ]
})
export class InstitutionModule { }
