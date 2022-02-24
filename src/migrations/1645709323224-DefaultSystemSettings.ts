import { MigrationInterface, QueryRunner } from 'typeorm';
import { SettingDto } from 'src/modules/setting/dtos/setting.dto';

const defaultConfig: SettingDto = {
    systemLocale: 'en',
    systemTimezone: 'Africa/Dar_es_Salaam',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'LT',
    dateTimeFormat: 'YYYY-MM-DD LT',
    passwordLifeTimeInDays: 365,
    passwordReUseCutoffInDays: 365,
    maxLoginAttempts: 5,
};

export class DefaultSystemSettings1645709323224 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const key in defaultConfig) {
            await queryRunner.query(
                `INSERT INTO "setting" ("key", "value") VALUES('${key}', '${defaultConfig[key]}')`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "setting"`);
    }
}
