import { MigrationInterface, QueryRunner } from "typeorm";

export class AssessmentEmail1670418679065 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`ALTER TABLE ${schemaName}.assessment ADD COLUMN "emailReminder" boolean`)
        await queryRunner.query(`ALTER TABLE ${schemaName}.assessment ADD COLUMN "emailStatus" character varying`)
        await queryRunner.query(`ALTER TABLE ${schemaName}.assessment ADD COLUMN "receiverEmail" character varying`)
        await queryRunner.query(`UPDATE ${schemaName}.assessment SET "emailStatus" = 'NOT_SCHEDULED', "emailReminder" = false`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
