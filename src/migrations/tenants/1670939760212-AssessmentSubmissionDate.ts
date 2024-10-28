import { MigrationInterface, QueryRunner } from "typeorm";

export class AssessmentSubmissionDate1670939760212 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`ALTER TABLE ${schemaName}.assessment ADD COLUMN "submissionDate" timestamp without time zone`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
