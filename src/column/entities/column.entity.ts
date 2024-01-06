import { BoardModel } from 'src/board/entities/board.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
}
