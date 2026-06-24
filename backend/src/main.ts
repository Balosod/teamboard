import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://your-frontend-url.com'
        : 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
