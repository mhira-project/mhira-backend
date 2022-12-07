import {MigrationInterface, QueryRunner} from "typeorm";

export class AssessmentEmail1670418679065 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "emailReminder" boolean`)
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "emailStatus" character varying`)
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "receiverEmail" character varying`)
        await queryRunner.query(`UPDATE assessment SET "emailStatus" = 'NOT_SCHEDULED', "emailReminder" = false`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
