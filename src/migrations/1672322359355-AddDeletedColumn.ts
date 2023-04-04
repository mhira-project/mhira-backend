import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDeletedColumn1672322359355 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN deleted boolean default false`)
        await queryRunner.query(`ALTER TABLE patient ADD COLUMN deleted boolean default false`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
