import { IsEnum } from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
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

  @OneToMany(() => BoardModel, (board) => board.ownership)
  boards: BoardModel[];

  @OneToMany(() => UserModel, (user) => user.ownership)
  users: UserModel[];
}
