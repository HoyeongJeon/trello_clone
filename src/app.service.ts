import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<h1>Trello Clone 프로젝트</h1>';
  }
}
