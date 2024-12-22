import { Field, InputType } from '@nestjs/graphql';

import { SUPPORTED_DATABASES } from '#src/types/database.types';

@InputType()
export class EditDbInitUploadInput {
  @Field()
  fileName: string;

  @Field()
  database: SUPPORTED_DATABASES;
}
