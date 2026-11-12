import { MigrationInterface, QueryRunner } from 'typeorm';
import { mongo } from 'mongoose';
import { configService } from 'src/config/config.service';
import { QuestionnaireStatus } from 'src/modules/questionnaire/models/questionnaire.schema';

export class QuestionnaireOldVersions1689180681401
    implements MigrationInterface {
    public async up(): Promise<void> {
        const client = new mongo.MongoClient(
            configService.getMongoConnectionString(),
        );

        try {
            await client.connect();

            const db = client.db();

            const questionnaireVersions = await db
                .collection('questionnaire_versions')
                .find()
                .toArray();
            const newVersions = []
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
                        { sort: { createdAt: -1 } },
                    );

                if (
                    version._id.toString() !== lastVersion._id.toString() ||
                    version.status == 'ARCHIVED' ||
                    version.questionnaire == null
                ) {
                    oldVersions.push(version._id);
                } else {
                    newVersions.push(version._id)
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
                    $set: {
                        zombie: true,
                    },
                },
            );

            await db.collection('questionnaire_versions').updateMany(
                {
                    _id: {
                        $in: newVersions,
                    },
                },
                {
                    $set: {
                        zombie: false,
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
            // Compatibility measure: the `drop` command, not dropCollection(),
            // which from driver 7 on treats a missing collection as dropped.
            // Up to driver 6 the drop of a missing `questionnaires` failed
            // and left `questionnaire_versions` unrenamed; the command keeps
            // that, error included.
            await db.command({ drop: 'questionnaires' })

            await db.renameCollection('questionnaire_versions', 'questionnaires')

            await db.collection('questionnaires').updateMany({}, {$unset: {questionnaire:1}})
        } catch (error) {
            console.log(error);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
