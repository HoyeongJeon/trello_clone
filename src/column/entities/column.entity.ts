import { BoardModel } from 'src/board/entities/board.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'columns' })
export class ColumnModel extends BaseModel {
  title: string;
  order: number;

  @ManyToOne(() => BoardModel, (board) => board.columns)
  board: BoardModel;
}
