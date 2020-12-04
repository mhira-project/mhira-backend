import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { CreatePatientInput } from './dto/create-patient.input';
import { UpdatePatientInput } from './dto/update-patient.input';
import { Patient } from './models/patient.model';

@Module({
    imports: [
        NestjsQueryGraphQLModule.forFeature({
            // import the NestjsQueryTypeOrmModule to register the entity with typeorm
            // and provide a QueryService
            imports: [NestjsQueryTypeOrmModule.forFeature([Patient])],
            // describe the resolvers you want to expose
            resolvers: [{
                DTOClass: Patient,
                EntityClass: Patient,
                CreateDTOClass: CreatePatientInput,
                UpdateDTOClass: UpdatePatientInput,
            }],
        }),
    ],
    providers: [],
})
export class PatientModule { }
