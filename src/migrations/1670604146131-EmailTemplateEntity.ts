import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailTemplateEntity1670604146131 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS mail_template
        (
            id SERIAL PRIMARY KEY,
            name character varying,
            subject character varying,
            body character varying,
            status boolean,
            module character varying
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
