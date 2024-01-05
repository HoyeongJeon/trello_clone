import { IsDate, IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, Generated } from 'typeorm';

@Entity({
  name: 'cards',
})
export class CardModel extends BaseModel {
  @IsString()
  @Column()
  members: string;

  @IsString()
  @Column()
  title: string;

  @IsString()
  @Column()
  description: string;

  @IsString()
  @Column()
  color: string;

  @IsNumber()
  @Column()
  order: number;

  @IsDate()
  @Column()
  startDate: Date;

  @IsDate()
  @Column()
  dueDate?: Date;

  // columnId 연결예정
}
