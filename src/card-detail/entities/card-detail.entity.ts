import { IsNotEmpty, IsString } from 'class-validator';
import { CardModel } from 'src/card/entities/card.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cardDetail')
export class CardDetail extends BaseModel {
  @IsNotEmpty({ message: '댓글을 입력해주세요' })
  @IsString()
  @Column({ type: 'text' })
  reviewText: string;

  @Column({ unsigned: true })
  userId: number;

  @Column({ unsigned: true })
  cardId: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => CardModel, (cardModel) => cardModel.cardDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cardModel: CardModel;

  @ManyToMany(() => UserModel, (userModel) => userModel.cardDetailReview, {
    eager: true,
    onDelete: 'CASCADE',
  })
  users: UserModel[];
}
