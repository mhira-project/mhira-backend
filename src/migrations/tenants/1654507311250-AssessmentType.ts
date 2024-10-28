import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssessmentType1654507311250 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS ${schemaName}.assessment_type
     (
         id               serial   constraint "PK_ab3af1c886a0939a6a7a702827d" primary key,
         name             varchar                 not null,
         status           character varying               ,
         "deletedAt"      timestamp,
         "createdAt"      timestamp default now() not null,
         "updatedAt"      timestamp default now() not null
     );
         `);

        await queryRunner.query(`
          
ALTER TABLE ${schemaName}.assessment ADD COLUMN "assessmentTypeId" INT
CONSTRAINT "FK_afc70332afbf0ed1cb481e2e49f" REFERENCES ${schemaName}.assessment_type(id)
ON UPDATE CASCADE ON DELETE NO ACTION;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`
        drop table ${schemaName}.assessment_type
         `);

        await queryRunner.query(`
         ALTER TABLE ${schemaName}.assessment
         DROP COLUMN "assessmentTypeId";
          `);
    }
}
