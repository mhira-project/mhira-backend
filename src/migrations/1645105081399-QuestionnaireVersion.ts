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

            const questionnaires = await db
                .collection('questionnaires')
                .find()
                .toArray();

            for (let i = 0; i < questionnaires.length; i++) {
                await db.collection('questionnaire_versions').updateMany(
                    {
                        questionnaire: {
                            $in: [questionnaires[i]._id],
                        },
                        language: { $exists: false }, // Check if field exists
                    },
                    {
                        $set: {
                            language: questionnaires[i].language, // Update field with a value
                        },
                    },
                );

                await db.collection('questionnaire_versions').updateMany(
                    {
                        questionnaire: {
                            $in: [questionnaires[i]._id],
                        },
                        abbreviation: { $exists: false }, // Check if field exists
                    },
                    {
                        $set: {
                            abbreviation: questionnaires[i].abbreviation, // Update field with a value
                        },
                    },
                );
            }
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
