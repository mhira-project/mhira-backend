import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedColumn1672322359355 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`ALTER TABLE ${schemaName}.assessment ADD COLUMN deleted boolean default false`)
        await queryRunner.query(`ALTER TABLE ${schemaName}.patient ADD COLUMN deleted boolean default false`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
