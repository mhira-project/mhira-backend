import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtraDisclaimers1654865143493 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const schemaName = queryRunner.connection.name;

        await queryRunner.query(`INSERT INTO ${schemaName}.disclaimer (type, description)
        VALUES (
           'completedText', 
            'This assessment has been completed!')`);

        await queryRunner.query(`INSERT INTO ${schemaName}.disclaimer (type, description)
        VALUES (
            'expiredText', 
            'Sorry, assessment is no longer available!'
            )`);

        await queryRunner.query(`INSERT INTO ${schemaName}.disclaimer (type, description)
            VALUES (
                'plannedText', 
                'Sorry, assessment is not available! It will be available at: '
                )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log('first');
    }
}
