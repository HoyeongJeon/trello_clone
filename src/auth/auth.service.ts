import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dtos/sign-up.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LogInDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, name, password, passwordConfirm } = signUpDto;
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    const existUser = await this.userRepository.findOneBy({ email });
    if (existUser) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(this.configService.get<string>('PASSWORD_HASH_ROUND')),
    );

    const user = await this.userRepository.save({
      email,
      name,
      password: hashedPassword,
    });

    return this.logIn(user.id);
  }

  // 토큰 생성
  logIn(userId: number) {
    // JWT 토큰 생성
    const payload = { id: userId };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async validateUser(logInDto: LogInDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: logInDto.email,
      },
      select: { id: true, password: true },
    });

    const isPasswordMatched = bcrypt.compareSync(
      logInDto.password,
      user?.password ?? '',
    );

    if (!user || !isPasswordMatched) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    return user;
  }
}
