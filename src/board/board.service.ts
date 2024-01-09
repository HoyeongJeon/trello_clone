import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { BoardModel, BoardVisibility } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardDto } from './dtos/create-board.dto';
import { UserModel } from 'src/user/entities/user.entity';
import { OwnershipModel, OwnershipType } from './entities/ownership.entity';
import { ColumnService } from 'src/column/column.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardModel)
    private readonly boardRepository: Repository<BoardModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(OwnershipModel)
    private readonly ownershipRepository: Repository<OwnershipModel>,
    private readonly columnService: ColumnService,
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
    qr?: QueryRunner,
  ) {
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

    const columns = await this.columnService.getAllColumns(boardId);
    return {
      ...board,
      columns,
    };
  }

  async inviteUser(board: BoardModel, user: UserModel, qr: QueryRunner) {
    const repository = this.getRepository(qr);
    const data = await repository.save({
      ...board,
      users: [...board.users, user],
    });

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

  async findPublicBoards() {
    const boards = await this.boardRepository.find({
      where: {
        visibility: BoardVisibility.PUBLIC,
      },
    });

    return boards;
  }

  async findMyBoards(userId: number) {
    // 내가 오너인 보드
    const boardsIOwn = await this.boardRepository.find({
      where: {
        owner: userId,
      },
    });

    // 내가 속해있는 보드
    // 오너쉽 테이블에 내가 속해있으면 갖고옴
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    const boardsIBelong = await this.ownershipRepository.find({
      where: {
        users: user,
      },
      relations: ['boards'],
    });

    return { ...boardsIOwn, ...boardsIBelong };
  }

  async authorizeUser(
    boardId: number,
    user: UserModel,
    level: OwnershipType,
    dataSource: DataSource,
  ) {
    await dataSource
      .createQueryBuilder()
      .update(OwnershipModel)
      .set({ level })
      .where('boards.id = :boardId', { boardId })
      .andWhere('users.id = :userId', { userId: user.id })
      .execute();
  }
}
