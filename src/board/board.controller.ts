import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateBoardDto } from './dtos/create-board.dto';
import { User } from 'src/user/decorators/user.decorator';
import { UserService } from 'src/user/user.service';
import { OwnershipType } from './entities/ownership.entity';
import { DataSource } from 'typeorm/data-source/DataSource';

@ApiTags('보드')
@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   *  보드 조회
   * @returns
   */
  @Get()
  async findPublicBoards() {
    const data = await this.boardService.findPublicBoards();
    return {
      statusCode: HttpStatus.OK,
      message: '보드 조회에 성공했습니다.',
      data,
    };
  }

  /**
   * 내가 속해있는 보드 조회
   * @param user
   * @returns
   */
  @Get('my-boards')
  @UseGuards(AuthGuard('jwt'))
  async findMyBoards(@User() user) {
    // 내가 속해있는 보드 찾기
    const data = await this.boardService.findMyBoards(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: '보드 조회에 성공했습니다.',
      data,
    };
  }

  /**
   * 보드 상세 조회
   * @param boardId
   * @returns
   */
  @Get(':boardId')
  @UseGuards(AuthGuard('jwt'))
  async findBoardById(@Param('boardId') boardId: number, @User() user) {
    const data = await this.boardService.findBoardById(boardId);
    const existingUser = await this.boardService.findUserOwnership(
      data,
      user.id,
    );
    if (!existingUser) {
      throw new UnauthorizedException('보드에 속해있지 않습니다.');
    }
    return {
      statusCode: HttpStatus.OK,
      message: '보드 조회에 성공했습니다.',
      data,
    };
  }

  /**
   * 보드 생성
   * @param createBoardDto
   * @returns
   */
  @ApiBearerAuth()
  @Post('/')
  @UseGuards(AuthGuard('jwt'))
  async createBoard(@Body() createBoardDto: CreateBoardDto, @User() user) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const board = await this.boardService.createBoard(
        createBoardDto,
        user.id,
        qr,
      );
      await this.boardService.saveOwnership(
        board,
        user.id,
        OwnershipType.OWNER,
        qr,
      );
      await qr.commitTransaction();
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }

    return {
      statusCode: HttpStatus.OK,
      message: '보드 생성에 성공했습니다.',
    };
  }

  /**
   * 보드 초대
   * @param boardId
   * @param user
   * @param targetEmail
   * @returns
   */
  @ApiBearerAuth()
  @Post(':boardId/invite')
  @UseGuards(AuthGuard('jwt'))
  async inviteUser(
    @Param('boardId') boardId: number,
    @User() user,
    @Body('targetEmail') targetEmail: string,
  ) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const board = await this.boardService.findBoardById(boardId);

      const userOwnership: unknown = await this.boardService.findUserOwnership(
        board,
        user.id,
      );

      // 권한 체크
      // 현재 로그인 한 유저가 요청하는 보드의 소유자 또는 관리자인지 확인한다.
      if (board.owner !== user.id || userOwnership === OwnershipType.MEMBER) {
        throw new UnauthorizedException('초대 권한이 없습니다.');
      }
      // 초대할 유저가 존재하는지 확인한다.
      const invitedUser = await this.userService.findUserByEmail(targetEmail);
      // 보드에 유저가 있는지 확인한다.
      const isUserInBoard = board.users.find(
        (user) => user.id === invitedUser.id,
      );
      if (isUserInBoard) {
        throw new UnauthorizedException('이미 보드에 속해있는 유저입니다.');
      }
      // 보드에 유저를 추가한다.
      await this.boardService.inviteUser(board, invitedUser, qr);
      await this.boardService.saveOwnership(
        board,
        invitedUser.id,
        OwnershipType.MEMBER,
        qr,
      );
      await qr.commitTransaction();
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }

    return {
      statusCode: HttpStatus.OK,
      message: '보드 초대에 성공했습니다.',
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
