import { PartialType } from '@nestjs/mapped-types';
import { CardModel } from '../entities/card.entity';

export class UpdateCardDto extends PartialType(CardModel) {
  title?: string;
  members?: string;
  description?: string;
  color?: string;
}
