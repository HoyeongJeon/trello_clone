import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserModel } from '../entities/user.entity';

export const User = createParamDecorator(
  (data: keyof UserModel | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserModel;
    if (!user) {
      throw new InternalServerErrorException(
        'User 데코레이터는 AuthGuard와 함께 사용해야 합니다. Request에 user 프로퍼티가 존재하지 않습니다.',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
