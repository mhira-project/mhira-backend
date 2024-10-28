import { MigrationInterface, QueryRunner } from "typeorm";

export class TemplatesDepartmentRelation1676554616779 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`CREATE TABLE ${schemaName}.department_mail_template (
            "departmentId" int NOT NULL,
            "mailTemplateId" int NOT NULL,
            PRIMARY KEY ("departmentId", "mailTemplateId")
        )`)
        await queryRunner.query(`ALTER TABLE ${schemaName}.mail_template ADD COLUMN "isPublic" boolean default false`)
        await queryRunner.query(`UPDATE ${schemaName}.mail_template SET "isPublic" = true`)
        await queryRunner.query(`ALTER TABLE ${schemaName}.assessment ADD COLUMN "mailTemplateId" INT REFERENCES ${schemaName}.mail_template(Id)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
