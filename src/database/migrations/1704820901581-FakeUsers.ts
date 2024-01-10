import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FakeUsers1704820901581 implements MigrationInterface {
  private readonly logger = new Logger(FakeUsers1704820901581.name);
  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Creating fake users...');
    for (let i = 0; i < 100; i++) {
      await queryRunner.query(`
      INSERT INTO \`users\` (email, password, name)
      VALUES
      ('user${i}@user.com', '!Asdf1234', 'User ${i}')
    `);
    }
    this.logger.log('Fake users created!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Deleting fake users...');
    await queryRunner.query(`
    DELETE FROM \`users\`
  `);
    this.logger.log('Fake users deleted!');
  }
}
