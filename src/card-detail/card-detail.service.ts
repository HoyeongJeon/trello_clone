import { Injectable, NotFoundException } from '@nestjs/common';
import { CardDetailReviewDto } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CardDetail } from './entities/card-detail.entity';
import { Repository } from 'typeorm';
import { UserModel } from 'src/user/entities/user.entity';
import { CardModel } from 'src/card/entities/card.entity';

@Injectable()
export class CardDetailService {
  constructor(
    @InjectRepository(CardDetail)
    private readonly cardDetailRepository: Repository<CardDetail>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(CardModel)
    private readonly cardRepository: Repository<CardModel>,
  ) {}

  async create(
    userId: number,
    cardId: number,
    { reviewText }: CardDetailReviewDto,
  ) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('해당 유저 정보를 찾을 수 없습니다.');
      }
      console.log(userId);

      const card = await this.cardRepository.findOneBy({ id: cardId });
      if (!card) {
        throw new NotFoundException('해당 카드가 존재하지 않습니다.');
      }
      const cardReview = await this.cardDetailRepository.save({
        userId: user.id,
        cardId: card.id,
        reviewText,
      });

      return cardReview;
    } catch (err) {
      throw err;
    }
  }

  async getReviewByCardDetail(cardId: number) {
    const cardReviews = await this.cardDetailRepository.find({
      where: { cardId },
      relations: {
        cardModel: {
          cardDetail: true,
        },
      },
    });
    return cardReviews;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} cardDetail`;
  // }

  // update(id: number, updateCardDetailDto: UpdateCardDetailDto) {
  //   return `This action updates a #${id} cardDetail`;
  // }

  remove(id: number) {
    return `This action removes a #${id} cardDetail`;
  }
}
