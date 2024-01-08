import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ColumnModel } from 'src/column/entities/column.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { OwnershipModel } from './ownership.entity';

export enum BoardVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity({ name: 'boards' })
export class BoardModel extends BaseModel {
  /**
   * 제목
   * @example '보드 제목'
   */
  @IsString()
  @IsNotEmpty()
  @Column()
  title: string;

  /**
   * 배경색
   * @example '#ffffff'
   */
  @IsString()
  @Column({
    default: '#ffffff',
  })
  background?: string;

  /**
   * 설명
   * @example '보드 설명'
   */
  @IsString()
  @Column({
    nullable: true,
  })
  description?: string;

  /**
   * 소유자
   * @example 1
   */
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

  @OneToMany(() => OwnershipModel, (ownership) => ownership.boards)
  public ownership: OwnershipModel[];
}
