import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('유저')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 내 정보 조회
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myProfile(@Request() req) {
    const userId = req.user.id;
    const data = await this.userService.findById(userId);
    return {
      statusCode: HttpStatus.OK,
      message: '내 정보 조회에 성공했습니다.',
      data,
    };
  }

  /**
   * 유저 정보 수정
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async patchUserInfo(@Request() req, @Body() body: UpdateUserDto) {
    const userId = req.user.id;
    const data = await this.userService.patchUserInfo(userId, body);
    return {
      statusCode: HttpStatus.OK,
      message: '내 정보 수정에 성공했습니다.',
      data,
    };
  }

  /**
   * 유저 삭제
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('me')
  async deleteUser(@Request() req) {
    const userId = req.user.id;
    await this.userService.deleteUser(userId);
    return {
      statusCode: HttpStatus.OK,
      message: '내 정보 삭제에 성공했습니다.',
    };
  }
}
