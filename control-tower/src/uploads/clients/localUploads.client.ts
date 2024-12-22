import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { rm, writeFile } from 'fs/promises';

import { DOKKIMI_LOCAL_FILES } from '#src/app.contants';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class LocalUploadsClient {
  public async saveDbInitFile(
    fileId: MongoID,
    extension: string,
    { buffer }: Express.Multer.File,
  ): Promise<string> {
    const rootPath = `${DOKKIMI_LOCAL_FILES}/db-init-files/${fileId}`;
    if (!existsSync(rootPath)) {
      mkdirSync(rootPath, { recursive: true });
    }

    await writeFile(`${rootPath}/${fileId}.${extension}`, buffer);
    return rootPath;
  }

  public async deleteFile(filePath: string): Promise<void> {
    if (existsSync(filePath)) {
      await rm(filePath, { recursive: true, force: true });
    }
  }
}
