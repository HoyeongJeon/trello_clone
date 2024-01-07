import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  Get,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';
import { UpdateOrderDto } from './dtos/order-column.dto';

@Controller(':boardId/column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Get()
  async getAllColumns(@Param('boardId') boardId: number) {
    return this.columnService.getAllColumns(boardId);
  }

  @Post()
  async createColumn(
    @Param('boardId') boardId: number,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return this.columnService.createColumn(boardId, createColumnDto);
  }

  @Put(':id')
  async updateColumn(
    @Param('id') id: number,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnService.updateColumn(id, updateColumnDto);
  }

  @Delete(':id')
  async deleteColumn(@Param('id') id: number) {
    return this.columnService.deleteColumn(id);
  }

  @Patch('order/:order')
  async updateColumnOrder(
    @Param('boardId') boardId: number,
    @Param('order') order: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.columnService.updateColumnOrderByOrder(
      boardId,
      order,
      updateOrderDto,
    );
  }
}
