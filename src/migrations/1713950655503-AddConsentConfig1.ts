import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConsentConfig11713950655503 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE consent ADD COLUMN "consent3" text`)
        await queryRunner.query(`ALTER TABLE consent ADD COLUMN "consent4" text`)
        await queryRunner.query(`ALTER TABLE consent ADD COLUMN "consent5" text`)
        await queryRunner.query(`ALTER TABLE consent ADD COLUMN "consent6" text`)
        await queryRunner.query(`ALTER TABLE consent ADD COLUMN "consent7" text`)
        await queryRunner.query(`ALTER TABLE consent ADD COLUMN "submitLabel" text`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
