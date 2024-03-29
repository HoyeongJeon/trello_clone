import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configModuleValidationSchema } from './configs/env-validation.config';
import { typeOrmModuleOptions } from './configs/database.config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { CardModule } from './card/card.module';
import { BoardModule } from './board/board.module';
import { ColumnModule } from './column/column.module';
import { CardDetailModule } from './card-detail/card-detail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    CommonModule,
    CardModule,
    BoardModule,
    ColumnModule,
    CardDetailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
