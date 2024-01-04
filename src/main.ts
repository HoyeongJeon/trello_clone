import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const SERVER_PORT = configService.get<number>('SERVER_PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 자동으로 타입을 변환해준다.
      whitelist: true, // decorator가 없는 속성들은 제거해준다.
      forbidNonWhitelisted: true, // decorator가 없는 속성이 있으면 요청 자체를 막는다.
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate')
    .setDescription('회원가입, 로그인, 인증, 인가 API 문서')
    .setVersion('1.0')
    .addTag('NestJS')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침해도 JWT 유지
      tagsSorter: 'alpha', // 태그 순서 알파벳 순으로 정렬
      operationsSorter: 'alpha', // API 순서 알파벳 순으로 정렬
    },
  });

  await app.listen(SERVER_PORT);
}
bootstrap();
