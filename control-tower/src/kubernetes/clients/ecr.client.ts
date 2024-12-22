import { Injectable, Logger } from '@nestjs/common';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_ACCESS_SECRET,
  region: process.env.AWS_REGION,
});

const sts = new AWS.STS();

@Injectable()
export class ECRClient {
  private readonly logger = new Logger(ECRClient.name);
  
  public async getAuthToken(clientAccountId: string, clientRegion: string) {
    try {
      const roleToAssume = {
        RoleArn: `arn:aws:iam::${clientAccountId}:role/Dokkimi-ECR`,
        RoleSessionName: `session-${Date.now()}`,
        DurationSeconds: 3600,
      };

      const { Credentials } = await sts.assumeRole(roleToAssume).promise();

      const ecr = new AWS.ECR({
        region: clientRegion,
        accessKeyId: Credentials.AccessKeyId,
        secretAccessKey: Credentials.SecretAccessKey,
        sessionToken: Credentials.SessionToken,
      });

      const tokenData = await ecr
        .getAuthorizationToken({
          registryIds: [clientAccountId],
        })
        .promise();

      const base64Token = tokenData.authorizationData[0].authorizationToken;
      const [username, password] = Buffer.from(base64Token, 'base64')
        .toString()
        .split(':');

      return {
        username,
        password,
      };
    } catch (err) {
      this.logger.error(err)
    }
  }
}
