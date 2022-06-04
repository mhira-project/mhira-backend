import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentInformant1651740038228 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "assessment" DROP COLUMN IF EXISTS informant`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS "informantType" character varying`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" DROP COLUMN IF EXISTS "informantCaregiverId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS "informantCaregiverRelation" character varying`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "assessment" RENAME COLUMN "informantType" TO informant`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" DROP COLUMN "informantCaregiverRelation"`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" ADD COLUMN "informantCaregiverId" integer`,
        );
    }
}
