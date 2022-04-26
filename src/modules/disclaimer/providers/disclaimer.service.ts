import { Injectable, NotFoundException } from '@nestjs/common';
import { Disclaimer } from '../models/disclaimer.model';

@Injectable()
export class DisclaimerService {
    async getDisclaimers(): Promise<Disclaimer[]> {
        const data = await Disclaimer.find();

        return data;
    }

    async updateDisclaimer(input): Promise<any> {
        const disclaimer = await Disclaimer.findOne({ type: input.type });

        if (!disclaimer)
            throw new NotFoundException('Disclaimer type not found!');

        disclaimer.description = input.description;

        await disclaimer.save();

        return disclaimer;
    }
}
