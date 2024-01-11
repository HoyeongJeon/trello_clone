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
  UseInterceptors,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBoardDto } from './dtos/create-board.dto';
import { User } from 'src/user/decorators/user.decorator';
import { UserService } from 'src/user/user.service';
import { OwnershipType } from './entities/ownership.entity';
import { DataSource } from 'typeorm/data-source/DataSource';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ColumnService } from 'src/column/column.service';
import { QueryRunner } from 'typeorm';
import { TransactionInterceptor } from 'src/common/interceptors/transaction.interceptor';
import { qr } from 'src/common/decorators/qr.decorator';

@ApiTags('보드')
@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly userService: UserService,
    private readonly columnService: ColumnService,
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @User() user,
    @qr() qr: QueryRunner,
  ) {
    const board = await this.boardService.createBoard(
      createBoardDto,
      user.id,
      qr,
    );

    await this.columnService.createDefaultColumns(board.id, qr);
    await this.boardService.saveOwnership(
      board,
      user.id,
      OwnershipType.OWNER,
      qr,
    );

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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  async inviteUser(
    @Param('boardId') boardId: number,
    @User() user,
    @Body('targetEmail') targetEmail: string,
    @qr() qr: QueryRunner,
  ) {
    const board = await this.boardService.findBoardById(boardId);

    const userOwnership: unknown = await this.boardService.findUserOwnership(
      board,
      user.id,
    );
    // 현재 로그인 한 유저가 요청하는 보드의 소유자 또는 관리자인지 확인한다. || 로그인 한 유저가 보드에 속해있는지도 확인
    if (userOwnership === OwnershipType.MEMBER || !userOwnership) {
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Delete(':boardId')
  async deleteBoard(@User() user, @Param('boardId') boardId: number) {
    await this.boardService.deleteBoard(user.id, boardId);
    return {
      statusCode: HttpStatus.OK,
      message: '보드 삭제에 성공했습니다.',
    };
  }

  // 권한 변경(Owner만 가능)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':boardId/authorize')
  async authorizeUser(
    @Param('boardId') boardId: number,
    @User() user,
    @Body('targetEmail') targetEmail: string,
    @Body('ownership') ownership: OwnershipType,
  ) {
    // 보드에 내가 속해있는지 확인한다.
    const targetBoard = await this.boardService.findBoardById(boardId);
    const myOwnership = await this.boardService.findUserOwnership(
      targetBoard,
      user.id,
    );

    // 내가 속해있는 보드의 권한을 확인한다.
    // 권한이 없다면 에러를 발생시킨다.
    if (!myOwnership || myOwnership === OwnershipType.MEMBER) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    const targetUser = targetBoard.users.find((user) => {
      if (user.email === targetEmail) {
        return user;
      }
    });

    if (!targetUser) {
      throw new UnauthorizedException('존재하지 않는 유저입니다.');
    }

    if (myOwnership === OwnershipType.OWNER) {
      // 아무런 권한을 다 줄 수 있음
      try {
        await this.boardService.authorizeUser(
          boardId,
          targetUser,
          ownership,
          this.dataSource,
        );
        return {
          statusCode: HttpStatus.OK,
          message: '권한 변경에 성공했습니다.',
        };
      } catch (error) {
        console.error(error);
        throw new UnauthorizedException('권한 변경에 실패했습니다.');
      }
    } else {
      throw new UnauthorizedException('권한 변경은 오너만 가능합니다.');
    }
  }
}
