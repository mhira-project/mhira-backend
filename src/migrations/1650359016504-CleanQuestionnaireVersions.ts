import { MigrationInterface, QueryRunner } from 'typeorm';

const MongoClient = require('mongodb').MongoClient;
const configService = require('../config/config.service').configService;

export class CleanQuestionnaireVersions1650359016504
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const client = new MongoClient(
            configService.getMongoConnectionString(),
            {
                useUnifiedTopology: true,
            },
        );

        try {
            await client.connect();

            const db = client.db();

            await db.collection('questionnaire_versions').deleteMany({
                language: { $exists: false }, // Check if field exists
                abbreviation: { $exists: false }, // Check if field exists
            });
        } catch (e) {
            console.log(e);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('asd');
    }
}
