import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConsent1713950655402 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS consent
        (
            id SERIAL PRIMARY KEY,
            name character varying,
            description text,
            consent1 text,
            consent2 text,
            "submitContent" text,
            "createdAt" timestamp default now() not null,
            "updatedAt" timestamp default now() not null
        )`);

        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "consentId" int`)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
