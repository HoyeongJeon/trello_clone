import { PartialType } from '@nestjs/swagger';
import { CardModel } from '../entities/card.entity';
import { IsNotEmpty } from 'class-validator';

export class CreateCardDto extends PartialType(CardModel) {
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  title: string;
  startDate?: Date;
}
