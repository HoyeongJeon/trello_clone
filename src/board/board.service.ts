import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BoardModel } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UserModel } from 'src/user/entities/user.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardModel)
    private readonly boardRepository: Repository<BoardModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  async createBoard(createBoardDto: CreateBoardDto, userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    const board = await this.boardRepository.save({
      ...createBoardDto,
      owner: userId,
      users: [user],
    });

    return board;
  }

  async patchBoard(
    createBoardDto: CreateBoardDto,
    userId: number,
    boardId: number,
  ) {
    const board = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      throw new UnauthorizedException('해당 보드가 없습니다.');
    }

    console.log(board.owner, userId);
    if (board.owner !== userId) {
      throw new UnauthorizedException('보드 수정은 오너만 가능합니다.');
    }

    const updatedBoard = await this.boardRepository.save({
      ...board,
      ...createBoardDto,
    });

    return updatedBoard;
  }

  async deleteBoard(userId: number, boardId: number) {
    const board = await this.boardRepository.findOne({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      throw new UnauthorizedException('해당 보드가 없습니다.');
    }

    if (board.owner !== userId) {
      throw new UnauthorizedException('보드 삭제는 오너만 가능합니다.');
    }

    await this.boardRepository.delete({
      id: boardId,
    });

    return true;
  }
}
