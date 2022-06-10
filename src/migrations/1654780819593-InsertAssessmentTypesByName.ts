import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertAssessmentTypesByName1654780819593
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          
        INSERT INTO assessment_type(name)
        SELECT name FROM assessment;

        `);

        await queryRunner.query(`
      
       UPDATE assessment_type 
       SET status = 'INACTIVE' WHERE status IS NULL;
 

        `);

        await queryRunner.query(`
      
       UPDATE assessment a SET "assessmentTypeId" = t.id FROM assessment_type t WHERE t.name = a.name;

        `);

        await queryRunner.query(`
      
        ALTER TABLE assessment DROP COLUMN name;

        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('first');
    }
}
