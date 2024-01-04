import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class UserModel extends BaseModel {
  /**
   * 이메일
   * @example 'test@test.com'
   */
  @IsNotEmpty({
    message: '이메일을 입력해주세요.',
  })
  @IsEmail(
    {},
    {
      message: '이메일 형식에 맞게 입력해주세요.',
    },
  )
  @Column({ unique: true })
  email: string;

  /**
   * 이름
   * @example '홍길동'
   */
  @IsNotEmpty({
    message: '이름을 입력해주세요.',
  })
  @IsString({
    message: '이름은 문자열로 입력해주세요.',
  })
  @Column()
  name: string;

  /**
   * 비밀번호
   * @example 'Test1234!'
   */
  @IsNotEmpty({
    message: '비밀번호를 입력해주세요.',
  })
  @IsStrongPassword(
    { minLength: 6 },
    {
      message:
        '비밀번호는 최소 6자리에 숫자, 영문 대문자, 영문 소문자, 특수문자가 포함되어야 합니다.',
    },
  )
  @Column({
    select: false,
  })
  password: string;
}
