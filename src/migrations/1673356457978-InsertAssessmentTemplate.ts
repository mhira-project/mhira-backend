import {MigrationInterface, QueryRunner} from "typeorm";
import { TemplateModuleEnum } from 'src/modules/mail/enums/template-module.enum';
import { AssessmentTypeEnum } from "src/modules/assessment/enums/assessment-type.enum";

export class InsertAssessmentTemplate1673356457978 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO mail_template(name, subject, body, status, module, "createdAt", "updatedAt")
            VALUES ('Assessment Template', 
                'Fill in your questionnaire', 
                '<p><span>Hello,</span></p><p><strong>Please fill in your questionnaire here: </strong><span>{{link}}</span></p><p><span>Thank you</span></p>', 
                '${AssessmentTypeEnum.ACTIVE}', 
                '${TemplateModuleEnum.ASSESSMENT}', 
                now(), 
                now()
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
