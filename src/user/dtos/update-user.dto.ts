import { PartialType } from '@nestjs/swagger';
import { UserModel } from '../entities/user.entity';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(UserModel) {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
