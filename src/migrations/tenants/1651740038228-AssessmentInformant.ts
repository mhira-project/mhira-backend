import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentInformant1651740038228 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" DROP COLUMN IF EXISTS informant`,
        );
        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" ADD COLUMN IF NOT EXISTS "informantType" character varying`,
        );
        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" DROP COLUMN IF EXISTS "informantCaregiverId"`,
        );
        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" ADD COLUMN IF NOT EXISTS "informantCaregiverRelation" character varying`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" RENAME COLUMN "informantType" TO informant`,
        );
        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" DROP COLUMN "informantCaregiverRelation"`,
        );
        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" ADD COLUMN "informantCaregiverId" integer`,
        );
    }
}
