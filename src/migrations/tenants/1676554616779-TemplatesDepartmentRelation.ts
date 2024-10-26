import {MigrationInterface, QueryRunner} from "typeorm";

export class TemplatesDepartmentRelation1676554616779 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE department_mail_template (
            "departmentId" int NOT NULL,
            "mailTemplateId" int NOT NULL,
            PRIMARY KEY ("departmentId", "mailTemplateId")
        )`)
        await queryRunner.query(`ALTER TABLE mail_template ADD COLUMN "isPublic" boolean default false`)
        await queryRunner.query(`UPDATE mail_template SET "isPublic" = true`)
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "mailTemplateId" INT REFERENCES mail_template(Id)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
