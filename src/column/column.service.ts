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
    if (!boardId) {
      throw new Error('보드 값을 입력해주세요.');
    }
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
  }

  async createColumn(
    boardId: number,
    createColumnDto: CreateColumnDto,
    qr?: QueryRunner,
  ): Promise<ColumnModel> {
    const repository = this.getRepository(qr);
    const lastColumn = await repository.findOne({
      where: { boardId },
      order: { order: 'DESC' },
    });

    let order = 1;
    let nextColumnId = null;

    if (lastColumn) {
      order = lastColumn.order + 1;
      nextColumnId = lastColumn.id;
    }

    const newColumn = repository.create({
      ...createColumnDto,
      boardId,
      order,
      nextColumnId,
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
    const columnToDelete = await this.columnRepository.findOne({
      where: { id },
    });
    if (!columnToDelete) {
      throw new Error('존재하지 않는 컬럼입니다.');
    }

    // 삭제할 컬럼의 순서
    const deleteOrder = columnToDelete.order;

    // 삭제할 컬럼보다 순서가 뒤에 있는 컬럼들의 순서를 감소
    await this.columnRepository
      .createQueryBuilder()
      .update(ColumnModel)
      .set({ order: () => 'order - 1' })
      .where('order > :deleteOrder', { deleteOrder })
      .execute();

    await this.columnRepository
      .createQueryBuilder()
      .update(ColumnModel)
      .set({ nextColumnId: columnToDelete.nextColumnId })
      .where('nextColumnId = :id', { id })
      .execute();

    await this.columnRepository.delete(id);
    return { message: '해당 컬럼을 삭제하였습니다' };
  }

  async updateColumnOrderByOrder(
    boardId: number,
    currentOrderId: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<{ columns: ColumnModel[]; message: string }> {
    const { toOrder } = updateOrderDto;

    // boardId와 order로 특정 컬럼 찾기
    const currentColumn = await this.columnRepository.findOne({
      where: { boardId, order: currentOrderId },
    });
    if (!currentColumn) {
      throw new Error('존재하지 않는 컬럼입니다.');
    }

    // 이동할 위치에 이미 존재하는 컬럼들의 순서 업데이트
    if (currentOrderId < toOrder) {
      // 컬럼을 뒤로 이동하는 경우
      await this.columnRepository
        .createQueryBuilder()
        .update(ColumnModel)
        .set({ order: () => '`order` - 1' })
        .where(
          'boardId = :boardId AND `order` BETWEEN :currentOrderId AND :toOrder',
          {
            boardId,
            currentOrderId: currentOrderId + 1, // 현재 컬럼 이후부터 시작
            toOrder,
          },
        )
        .execute();
    } else {
      // 컬럼을 앞으로 이동하는 경우
      await this.columnRepository
        .createQueryBuilder()
        .update(ColumnModel)
        .set({ order: () => '`order` + 1' })
        .where(
          'boardId = :boardId AND `order` BETWEEN :toOrder AND :currentOrderId',
          {
            boardId,
            toOrder,
            currentOrderId: currentOrderId - 1, // 현재 컬럼 이전까지
          },
        )
        .execute();
    }

    // nextColumnId 업데이트
    let newNextColumnId = null;
    if (toOrder < currentOrderId) {
      // 컬럼을 앞으로 이동하는 경우
      const nextColumn = await this.columnRepository.findOne({
        where: { boardId, order: toOrder + 1 },
      });
      newNextColumnId = nextColumn ? nextColumn.id : null;
    } else {
      // 컬럼을 뒤로 이동하는 경우
      const previousColumn = await this.columnRepository.findOne({
        where: { boardId, order: toOrder - 1 },
      });
      newNextColumnId = currentColumn.id;
      if (previousColumn) {
        // 이전 컬럼의 nextColumnId 업데이트
        await this.columnRepository.update(previousColumn.id, {
          nextColumnId: currentColumn.id,
        });
      }
    }

    // 현재 컬럼의 순서 및 nextColumnId 업데이트
    await this.columnRepository.update(currentColumn.id, {
      order: toOrder,
      nextColumnId: newNextColumnId,
    });

    // 보드의 모든 컬럼을 조회
    const updatedColumns = await this.columnRepository.find({
      where: { boardId: boardId },
      order: { order: 'ASC' },
    });

    return { columns: updatedColumns, message: '순서가 바뀌었습니다' };
  }

  async createDefaultColumns(boardId: number, qr?: QueryRunner) {
    await this.createColumn(boardId, { title: 'To Do' }, qr);
    await this.createColumn(boardId, { title: 'Doing' }, qr);
    await this.createColumn(boardId, { title: 'Done' }, qr);
  }
}
