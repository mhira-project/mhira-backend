import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConsentConfig1713950655502 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE consent ADD COLUMN "title" text`)
        await queryRunner.query(`ALTER TABLE consent ADD COLUMN "acceptLabel" text`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
