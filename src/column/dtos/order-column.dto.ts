import { IsString, IsIn } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @IsIn(['up', 'down'])
  direction: 'up' | 'down';
}
