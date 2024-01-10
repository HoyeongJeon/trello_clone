import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dtos/create-column.dto';
import { UpdateColumnDto } from './dtos/update-column.dto';
import { UpdateOrderDto } from './dtos/order-column.dto';
import { BoardService } from 'src/board/board.service';
import { User } from 'src/user/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller(':boardId/column')
export class ColumnController {
  constructor(
    private readonly columnService: ColumnService,
    private readonly boardService: BoardService,
  ) {}

  @Get()
  async getAllColumns(@Param('boardId') boardId: number) {
    return this.columnService.getAllColumns(boardId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createColumn(
    @Param('boardId') boardId: number,
    @User() user,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    const board = await this.boardService.findBoardById(boardId);
    const isUserInBoard = await this.boardService.findUserOwnership(
      board,
      user.id,
    );

    if (!isUserInBoard) {
      throw new UnauthorizedException('보드에 속해있지 않습니다.');
    }
    return this.columnService.createColumn(boardId, createColumnDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateColumn(
    @Param('id') id: number,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnService.updateColumn(id, updateColumnDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteColumn(@Param('id') id: number) {
    return this.columnService.deleteColumn(id);
  }

  @UseGuards(JwtAuthGuard)
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
