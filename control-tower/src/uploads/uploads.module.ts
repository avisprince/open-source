import { Module } from '@nestjs/common';

import { LocalUploadsClient } from '#src/uploads/clients/localUploads.client';
import { UploadsController } from '#src/uploads/uploads.controller';
import { UploadsResolver } from '#src/uploads/uploads.resolver';
import { UploadsService } from '#src/uploads/uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, UploadsResolver, LocalUploadsClient],
  exports: [UploadsService],
})
export class UploadsModule {}
