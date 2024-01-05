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

  async create(createCardDto: CreateCardDto) {
    const maxOrder = await this.cardRepository.findOne({
      where: {},
      order: { order: 'DESC' },
    });

    if (_.isNil(maxOrder)) {
      const result = await this.cardRepository.save({
        title: createCardDto.title,
        order: 1,
      });
      return result;
    }

    const result = await this.cardRepository.save({
      title: createCardDto.title,
      order: maxOrder.order + 1,
    });
    return result;
  }

  findAll() {
    return `This action returns all card`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
