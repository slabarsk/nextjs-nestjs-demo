import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Next.js frontend'in erişebilmesi için CORS açık
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE'],
  });

  await app.listen(3001);
  console.log('🚀 Nest.js API → http://localhost:3001');
}
bootstrap();
