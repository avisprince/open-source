import { PeerServerGateway } from '#src/websockets/peerServer.gateway';
import { Module } from '@nestjs/common';

@Module({
  providers: [PeerServerGateway],
  exports: [PeerServerGateway],
})
export class WebsocketsModule {}
