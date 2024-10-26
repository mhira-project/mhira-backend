import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentExpirationFields1649403519834
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS "expirationDate" timestamp without time zone`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" ADD COLUMN IF NOT EXISTS "deliveryDate" timestamp without time zone`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "assessment" DROP COLUMN "expirationDate"`,
        );
        await queryRunner.query(
            `ALTER TABLE "assessment" DROP COLUMN "deliveryDate"`,
        );
    }
}
