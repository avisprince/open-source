import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthStrategies } from '#src/auth/auth.constants';
import { Upload } from '#src/mongo/models';
import { MongoID } from '#src/types/mongo.types';
import { UploadsService } from '#src/uploads/uploads.service';
import { InitFileCustomization } from '#src/uploads/uploads.types';

@Controller('upload')
@UseGuards(AuthGuard(AuthStrategies.USER))
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('/:organizationId/dbInitFile')
  public uploadInitFile(
    @Param('organizationId') organizationId: MongoID,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: InitFileCustomization,
    @Req() req,
  ): Promise<Upload> {
    return this.uploadsService.createDbInitFile(
      organizationId,
      req.user.email,
      file,
      body,
    );
  }
}
