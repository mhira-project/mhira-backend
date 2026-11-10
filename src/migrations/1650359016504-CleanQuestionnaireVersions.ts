import { MigrationInterface, QueryRunner } from 'typeorm';

import { mongo } from 'mongoose';
const configService = require('../config/config.service').configService;

export class CleanQuestionnaireVersions1650359016504
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const client = new mongo.MongoClient(
            configService.getMongoConnectionString(),
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
        } finally {
            await client.close();
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('asd');
    }
}
