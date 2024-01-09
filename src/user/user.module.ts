import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BoardModel } from 'src/board/entities/board.entity';
import { OwnershipModel } from 'src/board/entities/ownership.entity';
import { CardDetail } from 'src/card-detail/entities/card-detail.entity';

@Module({
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([
      UserModel,
      BoardModel,
      OwnershipModel,
      CardDetail,
    ]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
