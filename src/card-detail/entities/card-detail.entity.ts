import { IsNotEmpty, IsString } from 'class-validator';
import { CardModel } from 'src/card/entities/card.entity';
import { BaseModel } from 'src/common/entities/base.entity';
import { UserModel } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cardDetail')
export class CardDetail extends BaseModel {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @IsNotEmpty({ message: '댓글을 입력해주세요' })
  @IsString()
  @Column({ type: 'text' })
  reviewText: string;

  @Column({ unsigned: true })
  cardId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CardModel, (cardModel) => cardModel.cardDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cardModel: CardModel;

  @ManyToOne(() => UserModel, (userModel) => userModel.cardDetailReview, {
    onDelete: 'CASCADE',
  })
  users: UserModel;
}
