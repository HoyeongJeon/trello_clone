import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not } from 'typeorm';
import { CardModel } from './entities/card.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(CardModel) private cardRepository: Repository<CardModel>,
  ) {}

  async create(
    boardId: number,
    columnId: number,
    createCardDto: CreateCardDto,
  ) {
    const maxOrder = await this.cardRepository.findOne({
      where: { columnId },
      order: { order: 'DESC' },
    });

    if (_.isNil(maxOrder)) {
      const result = await this.cardRepository.save({
        boardId,
        columnId,
        title: createCardDto.title,
        order: 1,
      });
      return {
        statusCode: 201,
        message: '카드 생성 성공하셨습니다.',
        data: { result },
      };
    }

    const result = await this.cardRepository.save({
      boardId,
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

  async findAll() {
    return await this.cardRepository.find();
  }

  async findOne(boardId: number, columnId: number, cardId: number) {
    const findCard = await this.findById(columnId, cardId);
    return findCard;
  }

  async update(
    boardId: number,
    columnId: number,
    cardId: number,
    updateCardDto: UpdateCardDto,
  ) {
    const { title, members, description, color } = updateCardDto;

    const findCard = await this.findById(columnId, cardId);

    if (_.isNil(findCard)) {
      throw new NotFoundException('존재하지 않는 카드입니다');
    }

    const updateCard = await this.cardRepository.update(
      { id: findCard.id },
      { title, members, description, color },
    );

    return updateCard;
  }

  async remove(boardId: number, columnId: number, cardId: number) {
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

  //카드 이동하기
  async move(
    boardId: number,
    columnId: number,
    cardId: number,
    moveCardDto: MoveCardDto,
  ) {
    const { order: newOrder } = moveCardDto;

    const findCard = await this.findById(columnId, cardId);

    if (_.isNil(findCard)) {
      throw new NotFoundException('존재하지 않는 카드입니다');
    }

    const currentOrder = findCard.order;
    await this.cardRepository.update({ id: findCard.id }, { order: newOrder });

    const otherCard = await this.cardRepository.findOne({
      where: {
        columnId,
        order: newOrder,
        id: Not(findCard.id),
      },
    });

    if (!otherCard) {
      throw new NotFoundException(
        '존재하지 않는 순서이거나 현재 순서와 같습니다.',
      );
    }
    await this.cardRepository.update(
      { id: otherCard.id },
      { order: currentOrder },
    );
    return { message: '카드 이동 완료.' };
  }
}