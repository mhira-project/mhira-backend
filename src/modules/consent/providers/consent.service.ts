import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Consent } from '../models/consent.model';
import { CreateOneConsentInput, DeleteOneConsentInput, UpdateOneConsentInput } from '../dtos/consent.dto';
import { CONNECTION } from 'src/modules/tenancy/tenancy.symbols';
import { Connection, Repository } from 'typeorm';


@Injectable()
export class ConsentService {
    private consentRepository: Repository<Consent>;
    constructor(@Inject(CONNECTION) private connection: Connection) {
        this.consentRepository = connection.getRepository(Consent);
    }
    async getConsents(): Promise<Consent[]> {
        const data = await this.consentRepository.find();
        return data;
    }

    async updateOneConsent(input: UpdateOneConsentInput): Promise<any> {
        const consent = await this.consentRepository.findOne({ id: input.id });

        if (!consent)
            throw new NotFoundException('Consent not found!');

        consent.name = input.name;
        consent.description = input.description;
        consent.consent1 = input.consent1;
        consent.consent2 = input.consent2;
        consent.consent3 = input.consent3;
        consent.consent4 = input.consent4;
        consent.consent5 = input.consent5;
        consent.consent6 = input.consent6;
        consent.consent7 = input.consent7;
        consent.submitContent = input.submitContent;
        consent.title = input.title;
        consent.acceptLabel = input.acceptLabel;
        consent.submitLabel = input.submitLabel;

        await this.consentRepository.save(consent);

        return consent;
    }

    async createOneConsent(input: CreateOneConsentInput): Promise<any> {
        const consent = this.consentRepository.create();

        consent.name = input.name;
        consent.description = input.description;
        consent.consent1 = input.consent1;
        consent.consent2 = input.consent2;
        consent.consent3 = input.consent3;
        consent.consent4 = input.consent4;
        consent.consent5 = input.consent5;
        consent.consent6 = input.consent6;
        consent.consent7 = input.consent7;
        consent.submitContent = input.submitContent;
        consent.title = input.title;
        consent.acceptLabel = input.acceptLabel;
        consent.submitLabel = input.submitLabel;

        await this.consentRepository.save(consent);

        return consent;
    }

    async deleteOneConsent(input: DeleteOneConsentInput): Promise<any> {
        const consent = await this.consentRepository.findOne(input.id);
        const consentId = consent.id;
        if (!consent)
            throw new NotFoundException('Consent not found!');

        await this.consentRepository.remove(consent);

        return {
            id: consentId
        };
    }
}
