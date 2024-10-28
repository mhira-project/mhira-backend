import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertAssessmentTypesByName1654780819593
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`
          
        INSERT INTO ${schemaName}.assessment_type(name)
        SELECT name FROM ${schemaName}.assessment;

        `);

        await queryRunner.query(`
      
       UPDATE ${schemaName}.assessment_type 
       SET status = 'INACTIVE' WHERE status IS NULL;
 

        `);

        await queryRunner.query(`
      
       UPDATE ${schemaName}.assessment a SET "assessmentTypeId" = t.id FROM assessment_type t WHERE t.name = a.name;

        `);

        await queryRunner.query(`
      
        ALTER TABLE ${schemaName}.assessment DROP COLUMN name;

        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('first');
    }
}
