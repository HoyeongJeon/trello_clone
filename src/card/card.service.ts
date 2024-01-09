import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not } from 'typeorm';
import { CardModel } from './entities/card.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { ColumnModel } from 'src/column/entities/column.entity';
import { BoardModel } from 'src/board/entities/board.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardModel)
    private readonly cardRepository: Repository<CardModel>,
    @InjectRepository(ColumnModel)
    private readonly columnRepository: Repository<ColumnModel>,
    @InjectRepository(BoardModel)
    private readonly boardRepository: Repository<BoardModel>,
  ) {}

  // 카드 생성
  async create(
    boardId: number,
    columnId: number,
    userId: number,
    createCardDto: CreateCardDto,
  ) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    const isMember = board.users.some((user) => user.id === userId);

    if (!isMember) {
      throw new BadRequestException('보드의 멤버가 아니면 생성할 수 없습니다');
    }

    const getBoard = await this.columnRepository.findOne({
      where: { id: columnId, boardId },
    });

    if (_.isNil(getBoard)) {
      throw new BadRequestException('존재하지않는 컬럼입니다');
    }

    const maxOrder = await this.cardRepository.findOne({
      where: { columnId },
      order: { order: 'DESC' },
    });

    if (_.isNil(maxOrder)) {
      const result = await this.cardRepository.save({
        columnId,
        title: createCardDto.title,
        startDate: createCardDto.startDate,
        order: 1,
      });
      return {
        statusCode: 201,
        message: '카드 생성 성공하셨습니다.',
        data: { result },
      };
    }

    const result = await this.cardRepository.save({
      columnId,
      title: createCardDto.title,
      order: maxOrder.order + 1,
    });
    return {
      statusCode: 201,
      message: '카드 생성 성공하셨습니다.',
      data: { result },
    };
  }

  // 카드 조회
  async findAll(columnId: number) {
    const result = await this.cardRepository.find({
      where: { columnId },
    });
    return result;
  }

  // 카드 상세 조회
  async findOne(boardId: number, columnId: number, cardId: number) {
    const findCard = await this.findById(columnId, cardId);
    return findCard;
  }

  // 카드 수정
  async update(
    boardId: number,
    columnId: number,
    cardId: number,
    userId: number,
    updateCardDto: UpdateCardDto,
  ) {
    const { title, members, description, color, startDate, dueDate } =
      updateCardDto;

    const findCard = await this.findById(columnId, cardId);

    if (_.isNil(findCard)) {
      throw new NotFoundException('존재하지 않는 카드입니다');
    }
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    const isUser = board.users.some((user) => user.id === userId);

    if (!isUser) {
      throw new BadRequestException('보드의 멤버가 아니면 수정할 수 없습니다');
    }

    const isMember = board.users.some((user) => user.name === members);

    if (!isMember) {
      throw new BadRequestException('보드의 멤버가 아니면 할당할 수 없습니다');
    }

    await this.cardRepository.update(
      { id: findCard.id },
      {
        title,
        members,
        description,
        color,
        startDate: new Date(startDate as any),
        dueDate: new Date(dueDate as any),
      },
    );

    return await this.cardRepository.findOne({
      where: { id: findCard.id },
    });
  }

  // 카드 삭제
  async remove(
    boardId: number,
    columnId: number,
    cardId: number,
    userId: number,
  ) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    const isMember = board.users.some((user) => user.id === userId);

    if (!isMember) {
      throw new BadRequestException('보드의 멤버가 아니면 삭제할 수 없습니다');
    }

    const findCard = await this.findById(columnId, cardId);

    if (_.isNil(findCard)) {
      throw new NotFoundException('존재하지 않는 카드입니다');
    }

    await this.cardRepository.delete({ id: findCard.id });
    return { message: '카드 삭제 성공하셨습니다' };
  }

  async findById(columnId: number, cardId: number) {
    return await this.cardRepository.findOne({
      where: { id: cardId, columnId },
    });
  }

  async findCardById(id: number) {
    const card = await this.cardRepository.findOne({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('존재하지 않는 카드입니다.');
    }

    return card;
  }

  //카드 이동하기
  async move(
    boardId: number,
    columnId: number,
    cardId: number,
    moveCardDto: MoveCardDto,
  ) {
    const { order: newOrder, columnId: newColumnId } = moveCardDto;
    const card = await this.findById(columnId, cardId);
    if (!card) {
      throw new NotFoundException('카드가 존재하지 않습니다.');
    }
    const column = await this.columnRepository.findOneBy({ id: newColumnId });
    if (!column) {
      throw new NotFoundException('존재하지 않는 컬럼입니다.');
    }

    // 다른 컬럼에 카드를 이동했을 경우
    if (columnId !== newColumnId) {
      // 다른 카드 찾기
      const otherCard = await this.cardRepository.findOne({
        where: {
          columnId: newColumnId,
          order: newOrder,
          id: Not(card.id),
        },
      });
      //카드가 존재하지 않을경우
      if (!otherCard) {
        return await this.cardRepository.update(
          { id: card.id },
          { columnId: newColumnId, order: newOrder },
        );
      }
      // 다른 카드가 order번호를 이미 갖고있을경우
      if (otherCard) {
        const existOrder = await this.cardRepository.findOne({
          where: {
            columnId: newColumnId,
            order: newOrder,
            id: Not(card.id),
          },
        });
        if (existOrder) {
          throw new NotFoundException(
            '해당 컬럼에 order번호가 이미 존재합니다.',
          );
        }
        return await this.cardRepository.update(
          { id: card.id },
          { columnId: newColumnId, order: newOrder },
        );
      }
      // 업데이트된 카드 정보 얻기
      const updatedCard = await this.findById(newColumnId, cardId);
      console.log(updatedCard);
    } else {
      //같은 컬럼내의 order 변경
      const otherCard = await this.cardRepository.findOne({
        where: {
          columnId: newColumnId,
          order: newOrder,
          id: Not(card.id),
        },
      });
      if (!otherCard) {
        throw new NotFoundException('교환할 카드가 없습니다.');
      }
      const tempOrder = otherCard.order;
      await this.cardRepository.update({ id: card.id }, { order: tempOrder });

      // 다른 카드의 order를 newOrder로 업데이트
      await this.cardRepository.update(
        { id: otherCard.id },
        { order: card.order },
      );
    }

    return { message: '카드 이동 완료.' };
  }
}
