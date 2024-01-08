import { IsDate, IsNumber, IsString } from 'class-validator';
import { ColumnModel } from 'src/column/entities/column.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

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
  @Column({ default: () => 'CURRENT_TIMESTAMP', nullable: false })
  startDate?: Date;

  @IsDate()
  @Column()
  dueDate?: Date;

  @Column()
  columnId: number;

  @ManyToOne(() => ColumnModel, (columns) => columns.card)
  columns: ColumnModel;
}
