import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('<h1>Trello Clone 프로젝트</h1>');
  });

  describe('/auth', () => {
    it('/auth (GET)', () => {
      return request(app.getHttpServer()).get('/auth').expect(404);
    });

    // it('/auth/signup (POST)', async () => {
    //   const signUpDtoMock = {
    //     email: 'test102@test.com',
    //     name: 'test',
    //     password: '!Asdf1234',
    //     passwordConfirm: '!Asdf1234',
    //   };

    //   const res = await request(app.getHttpServer())
    //     .post('/auth/signup')
    //     .send(signUpDtoMock)
    //     .expect(201);

    //   expect(res.status).toBe(201);
    // });

    it('/auth/login (POST)', async () => {
      const loginDtoMock = {
        email: 'test@test.com',
        password: '!Asdf1234',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDtoMock);

      expect(res.statusCode).toBe(200);
      console.log(res.headers);
    });
  });

  describe('/user', () => {
    it('/user/me (GET)', () => {
      return request(app.getHttpServer()).get('/user/me').expect(401);
    });
  });
});
