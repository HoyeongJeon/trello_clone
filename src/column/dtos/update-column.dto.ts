import { IsString } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  title: string;
}
