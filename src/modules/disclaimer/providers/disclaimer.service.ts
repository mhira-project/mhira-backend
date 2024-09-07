import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Disclaimer } from '../models/disclaimer.model';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbols';
import { Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class DisclaimerService {
    private disclaimerRepository: Repository<Disclaimer>;

    constructor(@Inject(CONNECTION) private connection) {
        this.disclaimerRepository = this.connection.getRepository(Disclaimer);
    }

    async getDisclaimers(): Promise<Disclaimer[]> {
        const data = await this.disclaimerRepository.find();

        return data;
    }

    async updateDisclaimer(input): Promise<any> {
        const disclaimer = await this.disclaimerRepository.findOne({ type: input.type });

        if (!disclaimer)
            throw new NotFoundException('Disclaimer type not found!');

        disclaimer.description = input.description;

        await this.disclaimerRepository.save(disclaimer);

        return disclaimer;
    }
}
