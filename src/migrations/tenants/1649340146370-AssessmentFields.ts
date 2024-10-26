import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentFields1649340146370 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS note varchar`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS "informantCaregiverId" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS "informantClinicianId" integer`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessment" DROP COLUMN note`);
        await queryRunner.query(
            `ALTER TABLE "assessment" DROP COLUMN "informantCaregiverId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" DROP COLUMN "informantClinicianId"`,
        );
    }
}
