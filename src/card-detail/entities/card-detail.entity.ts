import { IsNotEmpty, IsString } from 'class-validator';
import { CardModel } from 'src/card/entities/card.entity';
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
export class CardDetail {
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
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne((type) => CardModel, (cardModel) => cardModel.cardDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cardModel: CardModel;

  @ManyToOne((type) => UserModel, (userModel) => userModel.cardDetailReview, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserModel;
}
