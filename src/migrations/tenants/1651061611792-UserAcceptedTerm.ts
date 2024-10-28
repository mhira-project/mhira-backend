import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAcceptedTerm1651061611792 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(
            `ALTER TABLE ${schemaName}."user" ADD COLUMN IF NOT EXISTS "acceptedTerm" BOOLEAN DEFAULT false`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`ALTER TABLE ${schemaName}."user" DROP COLUMN acceptedTerm`);
    }
}
