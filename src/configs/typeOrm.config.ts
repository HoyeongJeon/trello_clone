import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
config();
const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get<string>('MYSQL_HOST'),
  port: +configService.get<number>('MYSQL_PORT'),
  username: configService.get<string>('MYSQL_USERNAME'),
  password: configService.get<string>('MYSQL_PASSWORD'),
  database: configService.get<string>('MYSQL_DATABASE'),
  synchronize: configService.get<boolean>('DB_SYNC'),
  migrations: ['src/database/migrations/*.ts'],
  entities: ['dist/**/*.entity{.ts,.js}'],
  logging: true,
});
