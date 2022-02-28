import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createReadStream, readFileSync } from 'fs';
import { isValidObjectId, Model, Types } from 'mongoose';
import { QuestionnaireScripts } from '../models/questionnaire-scripts.schema';

@Injectable()
export class QuestionnaireScriptsService {
    constructor(
        @InjectModel(QuestionnaireScripts.name)
        private questionnaireScriptsModel: Model<QuestionnaireScripts>,
    ) {}
    createNewScript(input: any) {
        this.readFileUpload(input.scriptText);
    }

    private async readFileUpload(fileData): Promise<any> {
        const file = await fileData;

        return new Promise(resolve => {
            const stream = file.createReadStream();
            const chunks = [];

            stream.on('data', (chunk: Buffer) => chunks.push(chunk));

            stream.on('end', () =>
                console.log(Buffer.concat(chunks).toString('utf-8')),
            );
        });
    }

    // return new Promise(resolve => {
    //     const stream = file.createReadStream();
    //     const chunks = [];

    //     stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    //     console.log(chunks);
    //     stream.on('end', () => {
    //         const fileData = file.parse(Buffer.concat(chunks), {
    //             type: 'buffer',
    //         });
    //         resolve(fileData);
    //     });
    // });
}
