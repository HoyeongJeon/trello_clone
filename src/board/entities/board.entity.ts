import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ColumnModel } from 'src/column/entities/column.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

export enum BoardVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity({ name: 'boards' })
export class BoardModel extends BaseModel {
  @IsString()
  @IsNotEmpty()
  @Column()
  title: string;

  @IsString()
  @Column({
    default: '#ffffff',
  })
  background?: string;

  @IsString()
  @Column({
    nullable: true,
  })
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Column()
  owner: number;

  @IsEnum(BoardVisibility)
  @Column({
    type: 'enum',
    enum: BoardVisibility,
    default: BoardVisibility.PUBLIC,
  })
  visibility?: BoardVisibility;

  //   columns?: string;

  @ManyToMany(() => UserModel, (user) => user.boards, {
    eager: true,
    onDelete: 'CASCADE',
  })
  users: UserModel[];

  @OneToMany(() => ColumnModel, (column) => column.board)
  columns: ColumnModel[];
}
