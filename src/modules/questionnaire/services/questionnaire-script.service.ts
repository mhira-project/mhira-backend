import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionnaireScriptInput } from '../dtos/questionnaire-script.input';
import { QuestionnaireScript } from '../models/questionnaire-script.model';

@Injectable()
export class QuestionnaireScriptService {
    constructor(
        @InjectRepository(QuestionnaireScript)
        private questionnaireScriptRepository: Repository<QuestionnaireScript>,
    ) {}
    async createNewScript(input: QuestionnaireScriptInput) {
        const { scriptText, ...rest } = input;
        const scriptTexts = await this.readFileUpload(scriptText);
        const newQuestionnaireScript = await this.questionnaireScriptRepository.create(
            {
                ...rest,
                scriptText: scriptTexts,
            },
        );

        await newQuestionnaireScript.save();

        return newQuestionnaireScript;
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
