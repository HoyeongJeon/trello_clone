import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';

@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post(':boardId')
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
}
