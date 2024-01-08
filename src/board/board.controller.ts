import {
  Body,
  Controller,
  Delete,
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
      await this.boardService.saveOwnership(board, user.id, qr);
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
    /**
     * 초대 하려면 무엇이 필요한가?
     * 1. 보드 아이디
     * 2. 초대할 유저 이메일
     * 3. 로그인 한 유저가 보드에 속해있는지 확인한다.
     * 4. 보드에 속해있지 않으면 에러를 던진다.
     * 5. 유저의 권한이 OWNER 또는 ADMIN이 아니면 에러를 던진다.
     * 6. 보드 아이디로 보드를 찾는다.
     * 7. 유저 이메일로 유저를 찾는다.
     * 8. 보드에 유저가 있는지 확인한다.
     * 9. 보드에 유저가 있으면 에러를 던진다.
  ManyToOne,
     * 10. 보드에 유저를 추가한다.
     * 11. 보드에 유저를 추가하면서 권한을 부여한다.
     * 12. 권한은 일단 MEMBER로 부여한다. ***
     */
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
      const data = await this.boardService.inviteUser(board, invitedUser);
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
