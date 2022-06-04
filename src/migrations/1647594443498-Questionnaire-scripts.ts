import { MigrationInterface, QueryRunner } from 'typeorm';

export class QuestionnaireScripts1647594443498 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        create table IF NOT EXISTS questionnaire_script
     (
         id               serial
         constraint "PK_a486e98875eace5a6257fd6b2f9"
             primary key,
         name             varchar                  not null,
         "scriptText"       varchar                  not null,
         "repositoryLink" varchar,
         creator          varchar,
         version          varchar,
         "deletedAt"      timestamp,
         "createdAt"      timestamp default now()  not null,
         "updatedAt"      timestamp default now()  not null,
         "questionnaireId"  varchar                  not null
     );
         `);

        await queryRunner.query(`
         create table IF NOT EXISTS questionnaire_script_report
         (
             id          serial
             constraint "PK_e5a0d33828fecb338f4cca87342"
                 primary key,
         "questionnaireScriptId"  integer                 not null
             constraint "FK_dbe4c661ea2447fb4c48befba91"
                 references questionnaire_script,
                 
         "reportId"    integer                 not null
             constraint "FK_6d65a158f4b7b750b2966f0eac5"
                 references report
         );
     
             `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        drop table questionnaire_script
         `);

        await queryRunner.query(`
         drop table questionnaire_script_report
          `);
    }
}
