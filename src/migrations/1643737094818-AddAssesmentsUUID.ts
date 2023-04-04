import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssesmentsUUID1643737094818 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS uuid varchar`);
        await queryRunner.query(`ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessment" DROP COLUMN uuid`);
        await queryRunner.query(`ALTER TABLE "assessment" DROP COLUMN isActive`);
    }
}
