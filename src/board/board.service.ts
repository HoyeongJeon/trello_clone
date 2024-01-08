import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { BoardModel } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UserModel } from 'src/user/entities/user.entity';
import { OwnershipModel, OwnershipType } from './entities/ownership.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardModel)
    private readonly boardRepository: Repository<BoardModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(OwnershipModel)
    private readonly ownershipRepository: Repository<OwnershipModel>,
    private readonly dataSource: DataSource,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(BoardModel) : this.boardRepository;
  }
  async createBoard(
    createBoardDto: CreateBoardDto,
    userId: number,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    const board = await repository.save({
      ...createBoardDto,
      owner: userId,
      users: [user],
    });

    return board;
  }

  getOwnerRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository(OwnershipModel)
      : this.ownershipRepository;
  }

  async saveOwnership(
    board: BoardModel,
    userId: number,
    level: OwnershipType,
    qr: QueryRunner,
  ) {
    // 트랜잭션 확인하기 save 시 자동으로 commit 됨
    // 에러 시 이 부분도 돌릴 수 없는가?
    const repository = this.getOwnerRepository(qr);

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    await repository.save({
      level,
      boards: board,
      users: user,
    });
  }

  async findUserOwnership(board: BoardModel, userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    const ownerships = await this.ownershipRepository.find();

    for (let i = 0; i < ownerships.length; i++) {
      if (
        ownerships[i].boards?.id === board.id &&
        ownerships[i].users?.id === user.id
      ) {
        return ownerships[i].level;
      }
    }
  }

  async findBoardById(boardId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const board = await repository.findOne({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      throw new UnauthorizedException('해당 보드가 없습니다.');
    }

    return board;
  }

  async inviteUser(board: BoardModel, user: UserModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);
    const data = await repository.save({
      ...board,
      users: [...board.users, user],
    });
    // await this.ownershipRepository.save({
    //   level: OwnershipType.MEMBER,
    //   boards: board,
    //   users: user,
    // });

    return data;
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
