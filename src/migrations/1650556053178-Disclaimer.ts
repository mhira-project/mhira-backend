import { MigrationInterface, QueryRunner } from 'typeorm';

export class Disclaimer1650556053178 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS disclaimer (
            type VARCHAR PRIMARY KEY,
            description VARCHAR NOT NULL,
            "updatedAt" TIMESTAMP WITHOUT TIME ZONE
        )`);

        await queryRunner.query(`INSERT INTO disclaimer (type, description)
        VALUES (
           'loginDisclaimer', 
            'The MHIRA platform stores sensible and private health information of patients. To protect the data, please make sure to never share your password with anyone. All actions in the system are logged and might be tracked back to your account. If you notice any data security risk, please notify the person responsible for MHIRA. Finally, please only share data of your patients for health care purposes or with the permission of your patients.')`);

        await queryRunner.query(`INSERT INTO disclaimer (type, description)
        VALUES (
            'assessments', 
            'This assessment will take some time to be seen by a clinician. In case of an emergency, please contact +3564563546435. Thank you!'
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE disclaimer`);
    }
}
