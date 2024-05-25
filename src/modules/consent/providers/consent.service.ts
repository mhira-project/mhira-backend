import { Injectable, NotFoundException } from '@nestjs/common';
import { Consent } from '../models/consent.model';
import { CreateOneConsentInput, DeleteOneConsentInput, UpdateOneConsentInput } from '../dtos/consent.dto';

@Injectable()
export class ConsentService {
    async getConsents(): Promise<Consent[]> {
        const data = await Consent.find();
        console.log('data', data)
        return data;
    }

    async updateOneConsent(input: UpdateOneConsentInput): Promise<any> {
        const consent = await Consent.findOne({ id: input.id });

        if (!consent)
            throw new NotFoundException('Consent not found!');

        consent.name = input.name;
        consent.description = input.description;
        consent.consent1 = input.consent1;
        consent.consent2 = input.consent2;
        consent.submitContent = input.submitContent;

        await consent.save();

        return consent;
    }

    async createOneConsent(input: CreateOneConsentInput): Promise<any> {
        const consent = new Consent();

        consent.name = input.name;
        consent.description = input.description;
        consent.consent1 = input.consent1;
        consent.consent2 = input.consent2;
        consent.submitContent = input.submitContent;

        await consent.save();

        return consent;
    }

    async deleteOneConsent(input: DeleteOneConsentInput): Promise<any> {
        const consent = await Consent.findOne(input.id);
        const consentId = consent.id;
        if (!consent)
            throw new NotFoundException('Consent not found!');

        await consent.remove();

        return {
            id: consentId
        };
    }
}
