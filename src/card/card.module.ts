import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardModel } from './entities/card.entity';
import { ColumnModel } from 'src/column/entities/column.entity';
import { CardDetail } from 'src/card-detail/entities/card-detail.entity';

@Module({
  exports: [CardService],
  imports: [TypeOrmModule.forFeature([CardModel, ColumnModel, CardDetail])],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
