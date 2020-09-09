import { Injectable } from '@nestjs/common'
import * as DataLoader from 'dataloader';
import { Any } from 'typeorm';
import { Institution } from 'src/modules/institution/models/institution.model';

@Injectable()
export class InstitutionLoader {

    public readonly findByIds = new DataLoader<Institution['id'], Institution>(async (institutionIds) => {
        try {
            const institutions = await Institution.find({ id: Any(institutionIds.concat()) })

            return institutionIds.map(institutionId => institutions.find(institution => institution.id === institutionId))
        } catch (error) {
            throw error
        }
    })
}
