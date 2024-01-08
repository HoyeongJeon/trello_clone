import { PartialType } from '@nestjs/mapped-types';
import { CardModel } from '../entities/card.entity';

//카드이동
export class MoveCardDto extends PartialType(CardModel) {
  order?: number;
}
