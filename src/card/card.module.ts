import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardModel } from './entities/card.entity';
import { ColumnModel } from 'src/column/entities/column.entity';
import { BoardModel } from 'src/board/entities/board.entity';
import { OwnershipModel } from 'src/board/entities/ownership.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { CardDetail } from 'src/card-detail/entities/card-detail.entity';
@Module({
  exports: [CardService],
  imports: [
    TypeOrmModule.forFeature([
      CardModel,
      ColumnModel,
      BoardModel,
      OwnershipModel,
      UserModel,
      CardDetail,
    ]),
  ],

  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
