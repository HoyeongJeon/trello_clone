import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnModel } from './entities/column.entity';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(ColumnModel)
    private columnRepository: Repository<ColumnModel>,
  ) {}

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
}
