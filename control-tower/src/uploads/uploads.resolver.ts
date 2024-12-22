import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  DeleteGuard,
  DeleteOperationGuard,
} from '#src/auth/authorization/delete.guard';
import {
  ReadGuard,
  ReadOperationGuard,
} from '#src/auth/authorization/read.guard';
import {
  UpdateGuard,
  UpdateOperationGuard,
} from '#src/auth/authorization/update.guard';
import { GqlUserStrategy } from '#src/auth/strategies/gqlUser.strategy';
import { Organization, Upload } from '#src/mongo/models';
import { EditDbInitUploadInput } from '#src/resolverInputs/upload.input';
import { MongoID } from '#src/types/mongo.types';
import { UploadsService } from '#src/uploads/uploads.service';

const ORGANIZATION_ID = 'organizationId';
const FILE_ID = 'fileId';

const returnUpload = () => Upload;
const returnUploadArr = () => [Upload];

@UseGuards(
  GqlUserStrategy,
  ReadOperationGuard,
  UpdateOperationGuard,
  DeleteOperationGuard,
)
@Resolver(returnUpload)
export class UploadsResolver {
  constructor(private readonly uploadsService: UploadsService) {}

  @Query(returnUploadArr)
  @ReadGuard({
    className: Organization.name,
    param: ORGANIZATION_ID,
  })
  public orgDbInitFiles(
    @Args(ORGANIZATION_ID, { type: () => ID }) organizationId: MongoID,
  ): Promise<Upload[]> {
    return this.uploadsService.getOrgDbInitFiles(organizationId);
  }

  @Mutation(returnUpload)
  @UpdateGuard({
    className: Upload.name,
    param: FILE_ID,
  })
  public updateDbInitFile(
    @Args(FILE_ID, { type: () => ID }) fileId: MongoID,
    @Args('file', { type: () => EditDbInitUploadInput })
    file: EditDbInitUploadInput,
  ): Promise<Upload> {
    return this.uploadsService.updateDbInitFile(fileId, file);
  }

  @Mutation(returnUpload)
  @DeleteGuard({
    className: Upload.name,
    param: FILE_ID,
  })
  public async deleteUpload(
    @Args(FILE_ID, { type: () => ID }) fileId: MongoID,
  ): Promise<Upload> {
    return this.uploadsService.deleteFile(fileId);
  }
}
