import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardDetail } from './entities/card-detail.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UserModel } from 'src/user/entities/user.entity';
import { CardModel } from 'src/card/entities/card.entity';
import { CardDetailReviewDto } from './dto/card-detail-reviwe.dto';
import { BoardModel } from 'src/board/entities/board.entity';
import _ from 'lodash';
import { ColumnModel } from 'src/column/entities/column.entity';
import {
  OwnershipModel,
  OwnershipType,
} from 'src/board/entities/ownership.entity';

@Injectable()
export class CardDetailService {
  constructor(
    @InjectRepository(CardDetail)
    private readonly cardDetailRepository: Repository<CardDetail>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(CardModel)
    private readonly cardRepository: Repository<CardModel>,
    @InjectRepository(BoardModel)
    private readonly boardRepository: Repository<BoardModel>,
    @InjectRepository(ColumnModel)
    private readonly columnModelRepository: Repository<ColumnModel>,
    @InjectRepository(OwnershipModel)
    private readonly ownershipModelRepository: Repository<OwnershipModel>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: number,
    boardId: number,
    columnId: number,
    cardId: number,
    { reviewText }: CardDetailReviewDto,
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('해당 유저 정보를 찾을 수 없습니다.');
    }

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (_.isNil(board)) {
      throw new BadRequestException('존재하지 않는 보드입니다');
    }

    const column = await this.columnModelRepository.findOneBy({
      id: columnId,
    });

    if (!column) {
      throw new NotFoundException('해당 컬럼이 존재하지 않습니다.');
    }

    const card = await this.cardRepository.findOneBy({ id: cardId });
    if (!card) {
      throw new NotFoundException('해당 카드가 존재하지 않습니다.');
    }
    const boardUser = board.users.some((users) => users.id === user.id);
    if (!boardUser) {
      throw new UnauthorizedException(
        '보드의 맴버가 아닌 유저는 생성할 수 없습니다.',
      );
    }

    const isOwner = await this.ownershipModelRepository.find({
      where: { level: In([OwnershipType.ADMIN, OwnershipType.OWNER]) },
    });

    const Owner = isOwner.some((owner) => {
      return owner.boards.id === boardId && owner.users.id === userId;
    });

    if (Owner) {
      const cardReview = await this.cardDetailRepository.save({
        userId: user.id,
        boardId: board.id,
        columnId: column.id,
        cardId: card.id,
        cardModel: card,
        reviewText,
      });

      return cardReview;
    }
    const userName = await this.userRepository.findOne({
      where: { id: userId },
    });

    const userInCard = await this.cardDetailRepository.findOneBy({
      userId: userName.id,
    });
    if (userInCard) {
      const cardReview = await this.cardDetailRepository.save({
        userId: user.id,
        boardId: board.id,
        columnId: column.id,
        cardId: card.id,
        reviewText,
      });

      return cardReview;
    }
    throw new UnauthorizedException(
      '카드의 생성자나 보드의 생성자가 아니면 댓글 생성을 할 수 없습니다',
    );
  }

  async getReviewByCardDetail(
    userId: number,
    boardId: number,
    columnId: number,
    cardId: number,
  ) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['users', 'columns', 'columns.card'],
    });

    if (_.isNil(board)) {
      throw new NotFoundException('존재하지 않는 보드입니다');
    }
    const column = board.columns.find((column) => column.id === columnId);

    if (!column) {
      throw new NotFoundException('존재하지 않는 컬럼입니다');
    }

    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['cardDetail'],
    });

    if (!card) {
      throw new NotFoundException('해당 카드가 존재하지 않습니다.');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('해당 유저 정보를 찾을 수 없습니다.');
    }

    const boardUser = board.users.some((users) => users.id === user.id);
    if (!boardUser) {
      throw new UnauthorizedException(
        '보드의 맴버가 아닌 유저는 생성할 수 없습니다.',
      );
    }

    const isOwner = await this.ownershipModelRepository.find({
      where: { level: In([OwnershipType.ADMIN, OwnershipType.OWNER]) },
    });

    const Owner = isOwner.some((owner) => {
      return owner.boards.id === boardId && owner.users.id === userId;
    });

    if (Owner) {
      const cardReviews = await this.cardDetailRepository.find({
        where: [{ id: board.id }, { id: column.id }, { cardId }],
        relations: {
          cardModel: {
            cardDetail: true,
          },
        },
        order: { createdAt: 'DESC' },
      });
      return cardReviews;
    }

    const userInCard = await this.cardDetailRepository.findOneBy({
      userId: user.id,
    });
    if (userInCard) {
      const cardReviews = await this.cardDetailRepository.find({
        where: [{ id: board.id }, { id: column.id }, { cardId }],
        relations: {
          cardModel: {
            cardDetail: true,
          },
        },
        order: { createdAt: 'DESC' },
      });
      return cardReviews;
    }
    throw new UnauthorizedException(
      '카드의 생성자나 보드의 생성자가 아니면 댓글 생성을 할 수 없습니다',
    );
  }

  async update(
    userId: number,
    boardId: number,
    columnId: number,
    cardId: number,
    id: number,
    { reviewText }: CardDetailReviewDto,
  ) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['users', 'columns', 'columns.card'],
    });
    if (_.isNil(board)) {
      throw new NotFoundException('해당 보드가 존재하지 않습니다.');
    }

    const column = board.columns.find((column) => column.id === columnId);

    if (!column) {
      throw new NotFoundException('해당 컬럼이 존재하지 않습니다.');
    }
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['cardDetail'],
    });

    if (!card) {
      throw new NotFoundException('해당 카드가 존재하지않습니다.');
    }
    const review = card.cardDetail.find((cardDetail) => cardDetail.id === id);

    if (!review) {
      throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('해당 유저 정보를 찾을 수 없습니다.');
    }
    const boardUser = board.users.some((users) => users.id === user.id);
    if (!boardUser) {
      throw new UnauthorizedException(
        '보드의 맴버가 아닌 유저는 수정할 수 없습니다.',
      );
    }

    const isOwner = await this.ownershipModelRepository.find({
      where: { level: In([OwnershipType.ADMIN, OwnershipType.OWNER]) },
    });

    const Owner = isOwner.some((owner) => {
      return owner.boards.id === boardId && owner.users.id === userId;
    });

    if (Owner) {
      const updateReview = await this.cardDetailRepository.save({
        ...review,
        reviewText,
      });

      return updateReview;
    }

    const userInCard = await this.cardDetailRepository.findOneBy({
      userId: user.id,
    });
    if (userInCard) {
      const updateReview = await this.cardDetailRepository.save({
        ...review,
        reviewText,
      });

      return updateReview;
    }
    throw new UnauthorizedException(
      '카드의 생성자나 보드의 생성자가 아니면 수정 권한이 없습니다.',
    );
  }

  async deleteReview(
    userId: number,
    boardId: number,
    columnId: number,
    cardId: number,
    id: number,
  ) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['users', 'columns', 'columns.card'],
    });

    if (_.isNil(board)) {
      throw new NotFoundException('존재하지 않는 보드입니다');
    }

    const column = board.columns.find((column) => column.id === columnId);

    if (!column) {
      throw new NotFoundException('존재하지 않는 컬럼입니다');
    }

    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['cardDetail'],
    });

    if (!card) {
      throw new NotFoundException('존재하지 않는 카드입니다');
    }

    const review = card.cardDetail.find((cardDetail) => cardDetail.id === id);

    if (!review) {
      throw new NotFoundException('해당 댓글이 존재하지 않습니다.');
    }

    const isOwner = await this.ownershipModelRepository.find({
      where: { level: In([OwnershipType.ADMIN, OwnershipType.OWNER]) },
    });

    const Owner = isOwner.some((owner) => {
      return owner.boards.id === boardId && owner.users.id === userId;
    });

    if (Owner) {
      await this.cardDetailRepository.delete({
        id: review.id,
      });

      return review;
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('해당 유저 정보를 찾을 수 없습니다.');
    }
    const boardUser = board.users.some((users) => users.id === user.id);
    if (!boardUser) {
      throw new UnauthorizedException(
        '보드의 맴버가 아닌 유저는 삭제할 수 없습니다.',
      );
    }

    const userInCard = await this.cardDetailRepository.findOneBy({
      userId: user.id,
    });
    if (userInCard) {
      // 삭제 성공 시
      await this.cardDetailRepository.delete({
        id: review.id,
      });

      return review;
    }
    throw new UnauthorizedException(
      '카드의 생성자나 보드의 생성자가 아니면 삭제 권한이 없습니다.',
    );
  }
}
