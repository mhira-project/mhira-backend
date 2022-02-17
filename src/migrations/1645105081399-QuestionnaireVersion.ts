import { MigrationInterface } from 'typeorm';

const MongoClient = require('mongodb').MongoClient;
const configService = require('../config/config.service').configService;

export class QuestionnaireVersion1645105081399 implements MigrationInterface {
    public async up(): Promise<void> {
        const client = new MongoClient(
            configService.getMongoConnectionString(),
            {
                useUnifiedTopology: true,
            },
        );

        try {
            await client.connect();

            const db = client.db();

            await db.collection('questionnaire_versions').updateMany(
                { language: { $exists: false } }, // Check if field exists
                { $set: { language: 'en' } }, // Update field with a value
            );
            await db.collection('questionnaire_versions').updateMany(
                { abbreviation: { $exists: false } }, // Check if field exists
                { $set: { abbreviation: 'PHQ-9' } }, // Update field with a value
            );
        } catch (error) {
            console.log(error);
        } finally {
            await client.close();
        }
    }

    public async down(): Promise<void> {
        const client = new MongoClient(
            configService.getMongoConnectionString(),
            {
                useUnifiedTopology: true,
            },
        );

        try {
            await client.connect();

            const db = client.db();

            await db
                .collection('questionnaire_versions')
                .updateMany({}, { $unset: { language: null } }); // Remove field from all collection data

            await db
                .collection('questionnaire_versions')
                .updateMany({}, { $unset: { abbreviation: null } }); // Remove field from all collection data
        } catch (error) {
            console.log(error);
        } finally {
            await client.close();
        }
    }
}
