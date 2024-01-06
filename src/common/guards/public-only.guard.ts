import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class PublicOnlyGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];

    if (rawToken) {
      const token = rawToken.split(' ')[1];
      const decoded = this.jwtService.verify(token);
      if (decoded) {
        throw new UnauthorizedException('이미 로그인한 사용자입니다.');
      }
    }
    return true;
  }
}
