import { Types } from 'mongoose';
import { AssessmentStatus } from 'src/modules/questionnaire/enums/assessment-status.enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

const configService = require('../../config/config.service').configService;
const MongoClient = require('mongodb').MongoClient;

export class AssessmentStatus1683188215805 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        const client = new MongoClient(
            configService.getMongoConnectionString(),
            {
                useUnifiedTopology: true,
            },
        );

        try {
            await client.connect();

            const db = client.db();

            const assessments = await queryRunner.query(
                `SELECT id, "questionnaireAssessmentId" FROM ${schemaName}.assessment`,
            );

            for (const assessment of assessments) {
                const _id = Types.ObjectId(
                    assessment.questionnaireAssessmentId,
                );
                const questionnaireAssessment = await db
                    .collection('assessments')
                    .findOne({ _id });

                await queryRunner.query(
                    `UPDATE ${schemaName}.assessment SET status = '${questionnaireAssessment.status ?? AssessmentStatus.PLANNED}' WHERE id = ${assessment.id}`,
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> { }
}
