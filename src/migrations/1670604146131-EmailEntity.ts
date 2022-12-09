import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailEntity1670604146131 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS mail
        (
            id SERIAL PRIMARY KEY,
            name character varying,
            subject character varying,
            body character varying,
            module character varying
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
