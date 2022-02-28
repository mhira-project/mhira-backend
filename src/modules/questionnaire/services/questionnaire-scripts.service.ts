import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createReadStream, readFileSync } from 'fs';
import { isValidObjectId, Model, Types } from 'mongoose';
import { QuestionnaireScriptsInput } from '../dtos/questionnaire-scripts.input';
import { QuestionnaireScripts } from '../models/questionnaire-scripts.schema';

@Injectable()
export class QuestionnaireScriptsService {
    constructor(
        @InjectModel(QuestionnaireScripts.name)
        private questionnaireScriptsModel: Model<QuestionnaireScripts>,
    ) {}
    async createNewScript(input: QuestionnaireScriptsInput) {
        const { scriptText, ...rest } = input;

        const scriptTexts = await this.readFileUpload(scriptText);

        const dif = await this.questionnaireScriptsModel.create({
            ...rest,
            scriptText: scriptTexts,
        });

        return dif;
    }

    private async readFileUpload(fileData): Promise<any> {
        const file = await fileData;

        return new Promise(resolve => {
            const stream = file.createReadStream();
            const chunks = [];

            stream.on('data', (chunk: Buffer) => chunks.push(chunk));

            stream.on('end', () =>
                resolve(Buffer.concat(chunks).toString('utf-8')),
            );
        });
    }
}
