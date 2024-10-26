import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantsTable1727537755000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE tenant (
            id SERIAL PRIMARY KEY,
            subdomain VARCHAR(255) unique NOT NULL,
            name VARCHAR(255) unique NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            "deletedAt" TIMESTAMP
        )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
