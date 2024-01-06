import { BoardModel } from 'src/board/entities/board.entity';
import { CardModel } from 'src/card/entities/card.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'columns' })
export class ColumnModel extends BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  order: number;

  @Column()
  boardId: number;

  @ManyToOne(() => BoardModel, (board) => board.columns)
  board: BoardModel;

  @OneToMany(() => CardModel, (card) => card.columns)
  card: CardModel[];
}
