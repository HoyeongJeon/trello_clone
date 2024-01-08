import { PartialType } from '@nestjs/mapped-types';
import { CardModel } from '../entities/card.entity';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateCardDto extends PartialType(CardModel) {
  title?: string;
  members?: string;
  description?: string;
  color?: string;
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;
}
