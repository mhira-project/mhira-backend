import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteCascadePatients1651139429314 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableRelated = [
            'assessment',
            'patient_caregiver',
            'patient_case_manager',
            'patient_department',
        ];

        for (const tableName of tableRelated) {
            const tableFKeys = await queryRunner.query(`select key_column_usage.constraint_name, column_name from information_schema.key_column_usage
        where constraint_catalog=current_catalog and table_name='${tableName}'
           and position_in_unique_constraint notnull;`);

            const patientIdFKey = tableFKeys.find(
                key => key.column_name === 'patientId',
            );

            await queryRunner.query(
                `ALTER TABLE "${tableName}"
                    drop CONSTRAINT "${patientIdFKey.constraint_name}";`,
            );

            await queryRunner.query(
                `ALTER TABLE  "${tableName}"
                     ADD CONSTRAINT "${patientIdFKey.constraint_name}"
                        FOREIGN KEY ("patientId")
                        REFERENCES "patient"
                            (id)
                        ON DELETE CASCADE ON UPDATE NO ACTION;`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableRelated = [
            'assessment',
            'patient_caregiver',
            'patient_case_manager',
            'patient_department',
        ];

        for (const tableName of tableRelated) {
            const tableFKeys = await queryRunner.query(`select key_column_usage.constraint_name, column_name from information_schema.key_column_usage
        where constraint_catalog=current_catalog and table_name='${tableName}'
           and position_in_unique_constraint notnull;`);

            const patientIdFKey = tableFKeys.find(
                key => key.column_name === 'patientId',
            );

            await queryRunner.query(
                `ALTER TABLE "${tableName}"
                    drop CONSTRAINT "${patientIdFKey.constraint_name}";`,
            );

            await queryRunner.query(
                `ALTER TABLE  "${tableName}"
                     ADD CONSTRAINT "${patientIdFKey.constraint_name}"
                        FOREIGN KEY ("patientId")
                        REFERENCES "patient"
                            (id)
                        ON DELETE NO ACTION ON UPDATE NO ACTION;`,
            );
        }
    }
}
