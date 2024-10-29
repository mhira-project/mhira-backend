import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConsent1713950655402 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${schemaName}.consent
        (
            id SERIAL PRIMARY KEY,
            name character varying,
            description text,
            consent1 text,
            consent2 text,
            consent3 text,
            consent4 text,
            consent5 text,
            consent6 text,
            consent7 text,
            "submitContent" text,
            title text,
            "acceptLabel" text,
            "submitLabel" text,
            "createdAt" timestamp default now() not null,
            "updatedAt" timestamp default now() not null
        )`);

        await queryRunner.query(`ALTER TABLE ${schemaName}.assessment ADD COLUMN "consentId" int`)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}