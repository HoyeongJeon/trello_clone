import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
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
    userId: number,
    createCardDto: CreateCardDto,
  ) {
    const maxOrder = await this.cardRepository.findOne({
      where: {},
      order: { order: 'DESC' },
    });

    if (_.isNil(maxOrder)) {
      const result = await this.cardRepository.save({
        boardId,
        columnId,
        userId,
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
    const findCard = await this.cardRepository.findOne({
      where: { id: cardId, columnId },
    });
    return findCard;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
