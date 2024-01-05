import { PartialType } from '@nestjs/swagger';
import { BoardModel, BoardVisibility } from '../entities/board.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateBoardDto extends PartialType(BoardModel) {
  @IsString()
  @IsOptional()
  background?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(BoardVisibility)
  @IsOptional()
  visibility?: BoardVisibility;
}
