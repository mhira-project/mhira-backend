import { MigrationInterface, QueryRunner } from 'typeorm';

export class Reports1644501851916 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
       create table IF NOT EXISTS report
    (
        id               serial
        constraint "PK_99e4d0bea58cba73c57f935a546"
            primary key,
        anonymus         boolean,
        name             varchar                 not null,
        description      varchar                 not null,
        status           boolean,
        "repositoryLink" varchar,
        "appName"        varchar,
        url              varchar,
        "deletedAt"      timestamp,
        "createdAt"      timestamp default now() not null,
        "updatedAt"      timestamp default now() not null,
        resources        varchar                 not null
    );
        `);
        await queryRunner.query(`
        create table IF NOT EXISTS report_role
        (
        "reportId"  integer                 not null
            constraint "FK_dfe51bc94484e59713aa9f35bba"
                references report,

        "roleId"    integer                 not null
            constraint "FK_e9df64b680b9a489f3b5b924992"
                references role
        );

            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('success');
    }
}
