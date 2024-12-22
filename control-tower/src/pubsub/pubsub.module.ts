import { PubSubService } from '#src/pubsub/pubsub.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [PubSubService],
  exports: [PubSubService],
})
export class PubSubModule {}
