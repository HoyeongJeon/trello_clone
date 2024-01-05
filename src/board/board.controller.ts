import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateBoardDto } from './dtos/create-board.dto';
import { User } from 'src/user/decorators/user.decorator';

@ApiTags('보드')
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  /**
   * 보드 생성
   * @param createBoardDto
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async createBoard(@Body() createBoardDto: CreateBoardDto, @User() user) {
    const data = await this.boardService.createBoard(createBoardDto, user.id);
    return {
      statusCode: HttpStatus.OK,
      message: '보드 생성에 성공했습니다.',
      data,
    };
  }

  /**
   * 보드 수정
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':boardId')
  async patchBoard(
    @Body() createBoardDto: CreateBoardDto,
    @User() users,
    @Param('boardId') boardId: number,
  ) {
    const data = await this.boardService.patchBoard(
      createBoardDto,
      users.id,
      boardId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: '보드 수정에 성공했습니다.',
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':boardId')
  async deleteBoard(@User() user, @Param('boardId') boardId: number) {
    await this.boardService.deleteBoard(user.id, boardId);
    return {
      statusCode: HttpStatus.OK,
      message: '보드 삭제에 성공했습니다.',
    };
  }
}
