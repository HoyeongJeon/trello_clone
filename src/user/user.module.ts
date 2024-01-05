import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BoardModel } from 'src/board/entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel, BoardModel]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
