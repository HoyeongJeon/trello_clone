import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PublicOnlyGuard } from 'src/common/guards/public-only.guard';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입
   * @param signUpDto
   * @returns
   */

  @UseGuards(PublicOnlyGuard)
  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    const data = await this.authService.signUp(signUpDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '회원가입에 성공했습니다.',
      data,
    };
  }

  /**
   * 로그인
   * @param req
   * @param logInDto
   * @returns
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(PublicOnlyGuard, AuthGuard('local'))
  @Post('login')
  login(@Request() req) {
    console.log(req.user.id);
    const data = this.authService.logIn(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: '로그인에 성공했습니다.',
      data,
    };
  }
}
