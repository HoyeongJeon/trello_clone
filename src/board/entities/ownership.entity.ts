import { IsEnum } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BoardModel } from './board.entity';
import { UserModel } from 'src/user/entities/user.entity';

export enum OwnershipType {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity({ name: 'ownership' })
export class OwnershipModel extends BaseModel {
  @IsEnum(OwnershipType)
  @Column({
    type: 'enum',
    enum: OwnershipType,
    default: OwnershipType.MEMBER,
  })
  level: OwnershipType;

  @ManyToOne(() => BoardModel, (board) => board.ownership, {
    eager: true,
    onDelete: 'CASCADE',
  })
  boards: BoardModel;

  @ManyToOne(() => UserModel, (user) => user.ownership, {
    eager: true,
    onDelete: 'CASCADE',
  })
  users: UserModel;
}
