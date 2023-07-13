import { MigrationInterface, QueryRunner } from 'typeorm';
import { MongoClient } from 'mongodb';
import { configService } from 'src/config/config.service';
import { QuestionnaireStatus } from 'src/modules/questionnaire/models/questionnaire.schema';

export class QuestionnaireOldVersions1689180681401
    implements MigrationInterface {
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

            const questionnaireVersions = await db
                .collection('questionnaire_versions')
                .find()
                .toArray();
            const oldVersions = [];
            const archived = [];

            for (let i = 0; i < questionnaireVersions.length; i++) {
                const version = questionnaireVersions[i];
                const questionnaireId = version.questionnaire;

                const lastVersion = await db
                    .collection('questionnaire_versions')
                    .findOne(
                        {
                            questionnaire: questionnaireId,
                        },
                        { sort: { timestamp: -1 } },
                    );

                if (
                    version._id.toString() !== lastVersion._id.toString() ||
                    version.status == 'ARCHIVED'
                ) {
                    oldVersions.push(version._id);
                }

                if (version.status == 'ARCHIVED') {
                    archived.push(version._id);
                }
            }

            await db.collection('questionnaire_versions').updateMany(
                {
                    _id: {
                        $in: oldVersions,
                    },
                },
                {
                    $setOnInsert: {
                        zombie: true,
                    },
                },
            );

            await db.collection('questionnaire_versions').updateMany(
                {
                    _id: {
                        $in: archived,
                    },
                },
                {
                    $set: {
                        status: QuestionnaireStatus.PUBLISHED,
                    },
                },
            );
            await db.dropCollection('questionnaires')

            await db.renameCollection('questionnaire_versions', 'questionnaires')

            await db.collection('questionnaires').updateMany({}, {$unset: {questionnaire:1}})
        } catch (error) {
            console.log(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
