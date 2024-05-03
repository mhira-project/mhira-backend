import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssessmentConsent1713950655002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "consentDescription" text`)
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "consentCheckbox1" text`)
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "consentCheckbox2" text`)
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "submitContent" text`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
