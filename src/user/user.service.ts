import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { UserModel } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr ? qr.manager.getRepository(UserModel) : this.userRepository;
  }

  async findById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const user = await repository.findOne({
      where: {
        id,
      },
      relations: {
        boards: true,
      },
    });
    if (!user) {
      throw new NotFoundException('해당하는 유저가 없습니다.');
    }
    return user;
  }

  async findUserByEmail(email: string) {
    console.log(email);
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('해당하는 유저가 없습니다.');
    }
    return user;
  }

  async patchUserInfo(id: number, body: UpdateUserDto) {
    const { name, password } = body;
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('해당하는 유저가 없습니다.');
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = password;
    }

    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('해당하는 유저가 없습니다.');
    }

    await this.userRepository.delete(user.id);

    return user;
  }
}
