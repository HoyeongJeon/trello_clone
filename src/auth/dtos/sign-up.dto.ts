import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { UserModel } from 'src/user/entities/user.entity';

export class SignUpDto extends PickType(UserModel, [
  'email',
  'password',
  'name',
]) {
  /**
   * 비밀번호 확인
   * @example 'Test1234!'
   */
  @IsString()
  @IsNotEmpty({
    message: '비밀번호 확인을 입력해주세요.',
  })
  @IsStrongPassword(
    { minLength: 6 },
    {
      message:
        '비밀번호는 최소 6자리에 숫자, 영문 대문자, 영문 소문자, 특수문자가 포함되어야 합니다.',
    },
  )
  passwordConfirm: string;
}
