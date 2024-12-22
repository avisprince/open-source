import Bugsnag from '@bugsnag/js';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';

import { AppLogger } from '#src/app.logger';
import { AppModule } from '#src/app.module';

if (process.env.BUGSNAG_API_KEY) {
  Bugsnag.start({ apiKey: process.env.BUGSNAG_API_KEY });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });

  app.enableCors();
  app.use(json({ limit: '1mb' }));

  await app.listen(process.env.PORT);

  console.info(`ControlTower is listening on port ${process.env.PORT}`);
}

bootstrap();
