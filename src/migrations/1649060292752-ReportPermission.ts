import { MigrationInterface, QueryRunner } from 'typeorm';
import { systemPermissions } from 'src/modules/permission/enums/permission.enum';

export class ReportPermission1649060292752 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const permission of systemPermissions) {
            await queryRunner.query(
                `INSERT INTO permission (name, "group") SELECT '${permission.name}', '${permission.group}' WHERE NOT EXISTS ( select 1 from permission where name='${permission.name}');`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Just to avoid errors in sonar cloud
        console.log('asd');
    }
}
