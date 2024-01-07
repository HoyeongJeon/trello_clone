import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnModel } from './entities/column.entity';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';
import { UpdateOrderDto } from './dtos/order-column.dto';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(ColumnModel)
    private columnRepository: Repository<ColumnModel>,
  ) {}

  async getAllColumns(boardId: number): Promise<ColumnModel[]> {
    return this.columnRepository.find({
      where: { boardId },
      order: { order: 'ASC' },
    });
  }

  async createColumn(
    boardId: number,
    createColumnDto: CreateColumnDto,
  ): Promise<ColumnModel> {
    const lastColumn = await this.columnRepository.find({
      where: { boardId },
      order: { order: 'DESC' },
      take: 1,
    });
    const order = lastColumn.length > 0 ? lastColumn[0].order + 1 : 1;

    const newColumn = this.columnRepository.create({
      ...createColumnDto,
      boardId,
      order,
    });
    return this.columnRepository.save(newColumn);
  }

  async updateColumn(
    id: number,
    updateColumnDto: UpdateColumnDto,
  ): Promise<ColumnModel> {
    await this.columnRepository.update(id, updateColumnDto);
    return this.columnRepository.findOne({ where: { id } });
  }

  async deleteColumn(id: number): Promise<void> {
    await this.columnRepository.delete(id);
  }

  async updateColumnOrderByOrder(
    boardId: number,
    order: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<ColumnModel> {
    const column = await this.columnRepository.findOne({
      where: { boardId, order },
    });

    if (!column) {
      throw new Error('존재하지 않는 컬럼입니다.');
    }

    const targetOrder =
      updateOrderDto.direction === 'up' ? order - 1 : order + 1;

    const targetColumn = await this.columnRepository.findOne({
      where: { boardId, order: targetOrder },
    });

    if (targetColumn) {
      // 순서바꾸기
      await this.columnRepository.save([
        { ...column, order: targetOrder },
        { ...targetColumn, order: order },
      ]);
    }

    return this.columnRepository.findOne({ where: { boardId, order } });
  }
}
