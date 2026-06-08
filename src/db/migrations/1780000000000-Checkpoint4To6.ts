import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class Checkpoint4To61780000000000 implements MigrationInterface {
  name = 'Checkpoint4To61780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appId" uuid NOT NULL, "name" character varying(255), "keyPrefix" character varying(32) NOT NULL, "keyHash" character varying NOT NULL, "expiresAt" TIMESTAMP, "revokedAt" TIMESTAMP, "rotatedFromId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_api_keys_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "config_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appId" uuid NOT NULL, "key" character varying(255) NOT NULL, "isSecret" boolean NOT NULL DEFAULT false, "currentVersion" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_config_entries_app_key" UNIQUE ("appId", "key"), CONSTRAINT "PK_config_entries_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "config_versions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "configId" uuid NOT NULL, "version" integer NOT NULL, "value" text NOT NULL, "createdByUserId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_config_versions_config_version" UNIQUE ("configId", "version"), CONSTRAINT "PK_config_versions_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_keys" ADD CONSTRAINT "FK_api_keys_app" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "config_entries" ADD CONSTRAINT "FK_config_entries_app" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "config_versions" ADD CONSTRAINT "FK_config_versions_config" FOREIGN KEY ("configId") REFERENCES "config_entries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "config_versions" ADD CONSTRAINT "FK_config_versions_user" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "config_versions" DROP CONSTRAINT "FK_config_versions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "config_versions" DROP CONSTRAINT "FK_config_versions_config"`,
    );
    await queryRunner.query(`ALTER TABLE "config_entries" DROP CONSTRAINT "FK_config_entries_app"`);
    await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_api_keys_app"`);
    await queryRunner.query(`DROP TABLE "config_versions"`);
    await queryRunner.query(`DROP TABLE "config_entries"`);
    await queryRunner.query(`DROP TABLE "api_keys"`);
  }
}
