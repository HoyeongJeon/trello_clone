import { PartialType } from '@nestjs/mapped-types';
import { CardModel } from '../entities/card.entity';

//컬럼 이동
export class MoveColumnDto extends PartialType(CardModel) {
  columnId?: number;
}
