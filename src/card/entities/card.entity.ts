import { IsDate, IsNumber, IsString } from 'class-validator';
import { CardDetail } from 'src/card-detail/entities/card-detail.entity';
import { ColumnModel } from 'src/column/entities/column.entity';
import { BaseModel } from 'src/common/entities/base.entity';

import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';


@Entity({
  name: 'cards',
})
export class CardModel extends BaseModel {
  @IsString()
  @Column({ nullable: true })
  members: string;

  @IsString()
  @Column()
  title: string;

  @IsString()
  @Column({ nullable: true })
  description: string;

  @IsString()
  @Column({ nullable: true })
  color: string;

  @IsNumber()
  @Column()
  order: number;

  @IsDate()
  @Column({ default: () => 'CURRENT_TIMESTAMP', nullable: false })
  startDate?: Date;

  @IsDate()
  @Column({
    nullable: true,
  })
  dueDate?: Date;

  @ManyToOne(() => ColumnModel, (column) => column.card)
  @JoinColumn()
  column: ColumnModel;

  @Column()
  columnId: number;

  @ManyToOne(() => ColumnModel, (columns) => columns.card)
  columns: ColumnModel;

  @OneToOne(() => CardDetail, (cardDetail) => cardDetail.cardModel)
  cardDetail: CardDetail;

}
