import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { CreatePatientInput } from './dto/create-patient.input';
import { UpdatePatientInput } from './dto/update-patient.input';
import { Informant } from './models/informant.model';
import { Patient } from './models/patient.model';
import { CaseManagerService } from './providers/case-manager.service';
import { CaseManagerResolver } from './resolvers/case-manager.resolver';

@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([
                Patient,
                Informant
            ])],
            // describe the resolvers you want to expose
            resolvers: [
                {
                    DTOClass: Patient,
                    EntityClass: Patient,
                    CreateDTOClass: CreatePatientInput,
                    UpdateDTOClass: UpdatePatientInput,
                },
                {
                    DTOClass: Informant,
                    EntityClass: Informant,
                },
            ],
        }),
    ],
    providers: [
        CaseManagerService,
        CaseManagerResolver,
    ],
})
export class PatientModule { }
