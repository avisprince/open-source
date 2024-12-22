import { Injectable } from '@nestjs/common';
import { last } from 'lodash';

import { Upload, UploadLocation, UploadType } from '#src/mongo/models';
import { UploadsRepository } from '#src/mongo/repositories';
import { EditDbInitUploadInput } from '#src/resolverInputs/upload.input';
import { MongoID } from '#src/types/mongo.types';
import { LocalUploadsClient } from '#src/uploads/clients/localUploads.client';
import { InitFileCustomization } from '#src/uploads/uploads.types';

@Injectable()
export class UploadsService {
  constructor(
    private readonly uploadsRepository: UploadsRepository,
    private readonly localUploadsClient: LocalUploadsClient,
  ) {}

  public getOrgDbInitFiles(organizationId: MongoID): Promise<Upload[]> {
    return this.uploadsRepository.find({
      'permissions.organizationId': organizationId,
      'metadata.type': UploadType.DB_INIT_FILE,
    });
  }

  public async createDbInitFile(
    organizationId: MongoID,
    author: string,
    file: Express.Multer.File,
    { newName, database }: InitFileCustomization,
  ): Promise<Upload> {
    const upload = await this.uploadsRepository.create({
      fileName: newName,
      fileSizeInBytes: file.size,
      fileExtension: last(file.originalname.split('.')),
      uploadLocation: UploadLocation.LOCAL,
      metadata: {
        type: UploadType.DB_INIT_FILE,
        database,
      },
      permissions: {
        organizationId,
        author,
        owner: author,
        memberOverrides: [],
      },
    });

    const savedFilePath = await this.localUploadsClient.saveDbInitFile(
      upload.id,
      upload.fileExtension,
      file,
    );

    return this.uploadsRepository.update(upload.id, {
      filePath: savedFilePath,
    });
  }

  public updateDbInitFile(
    fileId: MongoID,
    { fileName, database }: EditDbInitUploadInput,
  ): Promise<Upload> {
    return this.uploadsRepository.update(fileId, {
      fileName,
      metadata: {
        type: UploadType.DB_INIT_FILE,
        database,
      },
    });
  }

  public async deleteFile(fileId: MongoID): Promise<Upload> {
    const file = await this.uploadsRepository.findById(fileId);

    await Promise.all([
      this.uploadsRepository.delete(fileId),
      this.localUploadsClient.deleteFile(file.filePath),
    ]);

    return file;
  }
}
