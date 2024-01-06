import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardModel } from './entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardModel])],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
