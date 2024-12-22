import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '#src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4000);

  console.log('Traffic-Tester listening on port 4000');
}

bootstrap();
