import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardDetail } from './entities/card-detail.entity';
import { Repository } from 'typeorm';
import { UserModel } from 'src/user/entities/user.entity';
import { CardModel } from 'src/card/entities/card.entity';
import { CardDetailReviewDto } from './dto/card-detail-reviwe.dto';

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

  async update(
    userId: number,
    id: number,
    { reviewText }: CardDetailReviewDto,
  ) {
    try {
      const review = await this.cardDetailRepository.findOneBy({
        id,
      });
      if (!review) {
        throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
      }

      const user = await this.cardDetailRepository.findOneBy({
        userId: userId,
      });

      if (!user) {
        throw new UnauthorizedException('댓글 수정 권한이 없습니다.');
      }

      const updateReview = await this.cardDetailRepository.save({
        ...review,
        reviewText,
      });

      return updateReview;
    } catch (err) {
      throw err;
    }
  }

  async deleteReview(userId: number, id: number) {
    try {
      const review = await this.cardDetailRepository.findOneBy({
        id,
      });
      if (!review) {
        throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
      }

      const user = await this.cardDetailRepository.findOneBy({
        userId: userId,
      });

      if (!user) {
        throw new UnauthorizedException('댓글 수정 권한이 없습니다.');
      }

      const deleteReview = await this.cardDetailRepository.delete({
        id: review.id,
      });

      return deleteReview;
    } catch (err) {
      throw err;
    }
  }
}
