import { Module } from '@nestjs/common';

import { SecretsResolver } from '#src/secrets/secrets.resolver';
import { SecretsService } from '#src/secrets/secrets.service';

@Module({
  providers: [SecretsService, SecretsResolver],
  exports: [SecretsService],
})
export class SecretsModule {}
