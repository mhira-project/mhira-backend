import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
    CreateQuestionnaireScriptInput,
    UpdateQuestionnaireScriptInput,
} from '../dtos/questionnaire-script.input';
// import { QuestionnaireScriptReport } from '../models/questionnaire-script-report.model';
import { QuestionnaireScript } from '../models/questionnaire-script.model';
import { Report } from 'src/modules/report/models/report.model';
// import { UpdateQuestionnaireScriptInput } from '../resolvers/questionnaire-script.resolver';

@Injectable()
export class QuestionnaireScriptService {
    constructor(
        @InjectRepository(QuestionnaireScript)
        private questionnaireScriptRepository: Repository<QuestionnaireScript>, // @InjectRepository(QuestionnaireScriptReport) // private questionnaireScriptReportRepository: Repository< //     QuestionnaireScriptReport // >,
    ) {}
    async createNewScript(input: CreateQuestionnaireScriptInput) {
        const { scriptText, reportIds, ...rest } = input;
        const scriptTexts = await this.readFileUpload(scriptText);

        const reports = await Report.find({
            where: { id: In(reportIds) },
        });

        const newQuestionnaireScript = await this.questionnaireScriptRepository.create(
            {
                ...rest,
                scriptText: scriptTexts,
            },
        );

        newQuestionnaireScript.reports = reports;

        await newQuestionnaireScript.save();

        return newQuestionnaireScript;
    }

    async findQuestionnaireScripts(
        questionnaireId: number,
    ): Promise<QuestionnaireScript[]> {
        // const questionnaireScripts = await this.questionnaireScriptRepository.find();
        const questionnaireScripts = await this.questionnaireScriptRepository.find(
            {
                relations: ['reports'],
            },
        );

        return questionnaireScripts;
    }

    async updateQuestionnaireScripts(
        input: UpdateQuestionnaireScriptInput,
    ): Promise<QuestionnaireScript> {
        const { id, ...rest } = input;

        const questionnaireScript = await this.questionnaireScriptRepository.findOne(
            {
                relations: ['reports'],
                where: { id: 8 },
            },
        );
        //   const test = this.questionnaireScriptRepository.update({id}, {...rest}).then(response => response.raw[0]);

        const reports = await Report.find({ id: 7 });

        console.log(reports);

        questionnaireScript.reports = reports;

        await questionnaireScript.save();

        return questionnaireScript;
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
