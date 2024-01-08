import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    // 트랜잭션 관련 코드
    // 트랜잭션 순서
    // 1) 트랜젝션과 관련된 모든 쿼리를 담당할 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();
    // 2) 쿼리 러너에 연결한다.
    await qr.connect();
    // 3) 쿼리 러너에서 트랜잭션을 시작한다.
    // 이 시점부터 같은 쿼리 러너를 사용하면 트랜잭션 안에서 데이터베이스 액션을 실행 할 수 있다.

    // 시작하는 방법
    await qr.startTransaction();

    // 인터셉터를 거치면서 req.queryRunner에 qr을 넣어주면 비즈니스 로직에서도 사용할 수 있다.
    req.queryRunner = qr;

    return next.handle().pipe(
      // RxJS에서 에러 발생시 에러를 캐치할 수 있는 함수
      catchError(async (error) => {
        await qr.rollbackTransaction();
        await qr.release();

        throw new InternalServerErrorException(error.message);
      }),
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      }),
    );
  }
}
