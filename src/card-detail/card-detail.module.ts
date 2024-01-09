import { Module } from '@nestjs/common';
import { CardDetailService } from './card-detail.service';
import { CardDetailController } from './card-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from 'src/user/entities/user.entity';
import { CardModel } from 'src/card/entities/card.entity';
import { CardDetail } from './entities/card-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel, CardModel, CardDetail])],
  controllers: [CardDetailController],
  providers: [CardDetailService],
})
export class CardDetailModule {}
