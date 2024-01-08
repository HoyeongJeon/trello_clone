import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { BoardModel } from './entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from 'src/user/entities/user.entity';
import { OwnershipModel } from './entities/ownership.entity';
import { UserModule } from 'src/user/user.module';
import { ColumnModule } from 'src/column/column.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardModel, UserModel, OwnershipModel]),
    UserModule,
    ColumnModule,
  ],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
