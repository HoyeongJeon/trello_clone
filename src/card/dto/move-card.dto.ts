import { IsNumber } from 'class-validator';

export class MoveCardDto {
  @IsNumber()
  order?: number;

  @IsNumber()
  columnId?: number;
}
