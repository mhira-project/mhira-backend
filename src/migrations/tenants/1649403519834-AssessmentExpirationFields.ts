import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentExpirationFields1649403519834
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" ADD COLUMN IF NOT EXISTS "expirationDate" timestamp without time zone`,
        );
        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" ADD COLUMN IF NOT EXISTS "deliveryDate" timestamp without time zone`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" DROP COLUMN "expirationDate"`,
        );
        await queryRunner.query(
            `ALTER TABLE ${schemaName}."assessment" DROP COLUMN "deliveryDate"`,
        );
    }
}
