import {MigrationInterface, QueryRunner} from "typeorm";

export class Logs1690362794708 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS logs
        (
            id SERIAL PRIMARY KEY,
            operation character varying,
            "operationType" character varying,
            "returnType" character varying,
            "userAgent" character varying,
            "ipAddress" character varying,
            "responseTime" int NOT NULL,
            "queryResult" character varying,
            "mutationVariables" character varying,
            "errorMessage" character varying,
            "userId" int REFERENCES "user"(id),
            "createdAt"      timestamp default now() not null,
            "updatedAt"      timestamp default now() not null
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
