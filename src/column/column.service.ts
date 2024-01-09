import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ColumnModel } from './entities/column.entity';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';
import { UpdateOrderDto } from './dtos/order-column.dto';
import { CardService } from 'src/card/card.service';
import { QueryRunner, Repository } from 'typeorm';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(ColumnModel)
    private columnRepository: Repository<ColumnModel>,
    private cardService: CardService,
  ) {}
  getRepository(qr: QueryRunner) {
    return qr ? qr.manager.getRepository(ColumnModel) : this.columnRepository;
  }
  async getAllColumns(boardId: number): Promise<ColumnModel[]> {
    const columns = await this.columnRepository.find({
      where: { boardId: boardId },
      order: { order: 'ASC' },
    });

    const result = columns.map(async (column) => {
      const card = await this.cardService.findAll(column.id);
      return {
        ...column,
        card,
      };
    });

    const promiseResult = await Promise.all(result);

    return promiseResult;

    // return columns.map((column) => ({
    //   ...column,
    //   cards,
    // }));
  }

  async createColumn(
    boardId: number,
    createColumnDto: CreateColumnDto,
    qr?: QueryRunner,
  ): Promise<ColumnModel> {
    const repository = this.getRepository(qr);
    const lastColumn = await repository.find({
      where: { boardId },
      order: { order: 'DESC' },
      take: 1,
    });
    const order = lastColumn.length > 0 ? lastColumn[0].order + 1 : 1;

    const newColumn = repository.create({
      ...createColumnDto,
      boardId,
      order,
    });

    return repository.save(newColumn);
  }

  async updateColumn(
    id: number,
    updateColumnDto: UpdateColumnDto,
  ): Promise<ColumnModel> {
    await this.columnRepository.update(id, updateColumnDto);
    return this.columnRepository.findOne({ where: { id } });
  }

  async deleteColumn(id: number): Promise<{ message: string }> {
    const deletedOne = await this.columnRepository.delete(id);
    if (deletedOne.affected === 0) {
      throw new Error('이미 삭제된 컬럼입니다.');
    }
    return { message: '해당 컬럼을 삭제하였습니다' };
  }

  async updateColumnOrderByOrder(
    boardId: number,
    order: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<{ column: ColumnModel; message: string }> {
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

    const updatedColumn = await this.columnRepository.findOne({
      where: { id: column.id },
    });
    return { column: updatedColumn, message: '순서가 바뀌었습니다' };
  }

  async createDefaultColumns(boardId: number, qr?: QueryRunner) {
    await this.createColumn(boardId, { title: 'To Do' }, qr);
    await this.createColumn(boardId, { title: 'Doing' }, qr);
    await this.createColumn(boardId, { title: 'Done' }, qr);
  }
}
