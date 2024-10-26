import { MigrationInterface, QueryRunner } from "typeorm";

export class Caregivers1643899056854 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        create table IF NOT EXISTS caregiver
(
    id                 serial
        constraint "PK_114bf658fe2b416245381f89be0"
            primary key,
    "emergencyContact" boolean   default false not null,
    "firstName"        varchar,
    "middleName"       varchar,
    "lastName"         varchar,
    email              varchar,
    phone              varchar                 not null
        constraint "UQ_7483516d931f434dadc0112cf60"
            unique,
    "deletedAt"        timestamp,
    "createdAt"        timestamp default now() not null,
    "updatedAt"        timestamp default now() not null,
    street             varchar,
    country            varchar,
    place              varchar,
    apartment          varchar,
    "postalCode"       varchar,
    number             varchar
);
        `)

        await queryRunner.query(`
      create table IF NOT EXISTS patient_caregiver
(
    id            serial
        constraint "PK_835a0fa676526ee26379524b5fd"
            primary key,
    "deletedAt"   timestamp,
    "createdAt"   timestamp default now() not null,
    "updatedAt"   timestamp default now() not null,
    "patientId"   integer                 not null
        constraint "FK_a4b2a1d0f22f3f2c38aaf18f9e4"
            references patient,
    "caregiverId" integer                 not null
        constraint "FK_0db340ec8753c91db3dba218fd8"
            references caregiver,
    relation      varchar,
    note          text,
    emergency     boolean   default false,
    constraint "UQ_d1984b08df9e3fba76965be4aa3"
        unique ("patientId", "caregiverId")
);
        `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        console.log("success")
    }

}
