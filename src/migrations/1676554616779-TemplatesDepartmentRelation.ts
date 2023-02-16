import {MigrationInterface, QueryRunner} from "typeorm";

export class TemplatesDepartmentRelation1676554616779 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE mail_template ADD COLUMN "departmentId" INT NOT NULL REFERENCES department(Id)`)
        await queryRunner.query(`ALTER TABLE assessment ADD COLUMN "mailTemplateId" INT REFERENCES mail_template(Id)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
