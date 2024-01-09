import { IsInt, Min } from 'class-validator';

export class UpdateOrderDto {
  @IsInt()
  @Min(1)
  toOrder: number;
}
