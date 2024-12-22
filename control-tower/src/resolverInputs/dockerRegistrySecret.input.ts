import { Field, ID, InputType, Int } from '@nestjs/graphql';

import { PermissionsInput } from '#src/resolverInputs/permissions.input';
import { MongoID } from '#src/types/mongo.types';

@InputType()
export class DockerRegistrySecretInput {
  @Field(() => ID, { nullable: true })
  id?: MongoID;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { defaultValue: 'Docker' })
  repository: 'ECR' | 'Docker';

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  accessToken?: string;

  @Field(() => Int, { nullable: true })
  accessTokenLength?: number;

  @Field(() => String, { nullable: true })
  ecrClientId?: string;

  @Field(() => String, { nullable: true })
  ecrClientRegion?: string;

  @Field(() => PermissionsInput, { nullable: true })
  permissions?: PermissionsInput;
}
