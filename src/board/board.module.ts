import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { BoardModel } from './entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardModel, UserModel])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
