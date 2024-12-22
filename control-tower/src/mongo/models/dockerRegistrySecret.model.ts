import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { isArray } from 'lodash';

import { HasPermissions } from '#src/mongo/models/permissions.model';
import { MongoID } from '#src/types/mongo.types';

@ObjectType()
@Schema({ timestamps: true, toJSON: { virtuals: true } })
export class DockerRegistrySecret extends HasPermissions {
  @Field(() => ID)
  id: MongoID;

  @Field({ nullable: true })
  @Prop()
  name?: string;

  @Field({ defaultValue: 'Docker' })
  @Prop()
  repository: 'ECR' | 'Docker';

  @Field({ nullable: true })
  @Prop()
  username?: string;

  @Field({ nullable: true })
  @Prop()
  accessToken?: string;

  @Field({ nullable: true })
  @Prop()
  accessTokenLength?: number;

  @Prop()
  auth: string;

  @Field({ nullable: true })
  @Prop()
  ecrClientId?: string;

  @Field({ nullable: true })
  @Prop()
  ecrClientRegion?: string;
}

export type DockerRegistrySecretDocument = DockerRegistrySecret;

export const DockerRegistrySecretSchema =
  SchemaFactory.createForClass(DockerRegistrySecret);

DockerRegistrySecretSchema.post(
  [
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndUpdate',
    'updateOne',
  ],
  (doc: DockerRegistrySecret | Array<DockerRegistrySecret>) => {
    const secrets = isArray(doc) ? doc : [doc];
    secrets.forEach(secret => {
      secret.auth = Buffer.from(
        `${secret.username}:${secret.accessToken}`,
      ).toString('base64');
      secret.accessTokenLength = secret.accessToken?.length ?? 0;
      secret.accessToken = 'a'.repeat(secret.accessTokenLength);
    });
  },
);
