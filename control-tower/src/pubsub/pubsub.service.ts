import { Injectable } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PubSub } from 'graphql-subscriptions';
import Redis, { RedisOptions } from 'ioredis';

import { BOOLEAN } from '#src/constants/environment.constants';

@Injectable()
export class PubSubService {
  private readonly pubsubOptions: RedisOptions = {
    host: process.env.REDIS_SERVER_IP,
    port: parseInt(process.env.REDIS_SERVER_PORT),
    password: process.env.REDIS_SERVER_PASSWORD,
    retryStrategy: times => Math.min(times * 50, 2000),
  };

  private readonly pubsub = new PubSub();

  private readonly redisPubSub =
    process.env.USE_REDIS === BOOLEAN.TRUE
      ? new RedisPubSub({
          publisher: new Redis(this.pubsubOptions),
          subscriber: new Redis(this.pubsubOptions),
        })
      : new PubSub();

  public getPubSub() {
    return process.env.USE_REDIS === BOOLEAN.TRUE
      ? this.redisPubSub
      : this.pubsub;
  }

  public async publish(arg0: string, payload: any) {
    await this.getPubSub().publish(arg0, payload);
  }

  public asyncIterator(triggers: string | string[]) {
    return this.getPubSub().asyncIterator(triggers);
  }
}
