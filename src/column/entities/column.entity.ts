import { BoardModel } from 'src/board/entities/board.entity';
import { CardModel } from 'src/card/entities/card.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity({ name: 'columns' })
export class ColumnModel extends BaseModel {
  @Column()
  title: string;

  @Column()
  order: number;

  @Column({ nullable: false })
  boardId: number;

  @ManyToOne(() => BoardModel, (board) => board.columns)
  board: BoardModel;

  @OneToMany(() => CardModel, (card) => card.columns)
  card: CardModel[];
}
