import {MigrationInterface, QueryRunner} from "typeorm";

export class DeleteCascadeUsers1664531282964 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableRelated = [
            'access_token',
            'user_previous_password',
        ];

        for (const tableName of tableRelated) {
            const tableFKeys = await queryRunner.query(`select key_column_usage.constraint_name, column_name from information_schema.key_column_usage
        where constraint_catalog=current_catalog and table_name='${tableName}'
           and position_in_unique_constraint notnull;`);

            const userIdFKey = tableFKeys.find(
                key => key.column_name === 'userId',
            );

            await queryRunner.query(
                `ALTER TABLE "${tableName}"
                    drop CONSTRAINT "${userIdFKey.constraint_name}";`,
            );

            await queryRunner.query(
                `ALTER TABLE  "${tableName}"
                     ADD CONSTRAINT "${userIdFKey.constraint_name}"
                        FOREIGN KEY ("userId")
                        REFERENCES "user"
                            (id)
                        ON DELETE CASCADE ON UPDATE NO ACTION;`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableRelated = [
            'access_token',
            'user_previous_password',
        ];
        for (const tableName of tableRelated) {
            const tableFKeys = await queryRunner.query(`select key_column_usage.constraint_name, column_name from information_schema.key_column_usage
        where constraint_catalog=current_catalog and table_name='${tableName}'
           and position_in_unique_constraint notnull;`);

            const userIdFKey = tableFKeys.find(
                key => key.column_name === 'userId',
            );

            await queryRunner.query(
                `ALTER TABLE "${tableName}"
                    drop CONSTRAINT "${userIdFKey.constraint_name}";`,
            );

            await queryRunner.query(
                `ALTER TABLE  "${tableName}"
                     ADD CONSTRAINT "${userIdFKey.constraint_name}"
                        FOREIGN KEY ("userId")
                        REFERENCES "user"
                            (id)
                        ON DELETE NO ACTION ON UPDATE NO ACTION;`,
            );
        }
    }

}
