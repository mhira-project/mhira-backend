import { QueryService } from '@nestjs-query/core';
import { EmergencyContact } from '../models/emergency-contact.model';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbols';
import { Inject } from '@nestjs/common';
import { Connection } from 'typeorm';

@QueryService(EmergencyContact)
export class EmergencyContactService extends TypeOrmQueryService<EmergencyContact> {
    constructor(@Inject(CONNECTION) connection: Connection) {
        super(connection.getRepository(EmergencyContact));
    }
}