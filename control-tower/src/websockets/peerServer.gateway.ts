import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Express } from 'express';
import { createServer } from 'http';
import { ExpressPeerServer } from 'peer';

import { Namespace } from '#src/mongo/models';
import { NamespacesRepository } from '#src/mongo/repositories';
import { PubSubService } from '#src/pubsub/pubsub.service';

@Injectable()
export class PeerServerGateway implements OnModuleInit {
  private readonly httpServer: any;
  private readonly peerServer: any;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly namespacesRepository: NamespacesRepository,
    private readonly pubsubService: PubSubService,
  ) {
    const expressInstance: Express =
      this.httpAdapterHost.httpAdapter.getInstance();
    this.httpServer = createServer(expressInstance);
    this.peerServer = ExpressPeerServer(this.httpServer, {
      key: process.env.PEER_SERVER_ACCESS_TOKEN,
      allow_discovery: true,
    });

    expressInstance.use('/namespaces', this.peerServer);

    this.peerServer.on('connection', async client => {
      const [namespaceId, userId] = client.getId().split('-');
      if (!namespaceId) {
        return;
      }

      const namespace = await this.namespacesRepository.addActiveUser(
        namespaceId,
        {
          peerId: client.getId(),
          user: userId,
          color: this.generateRandomColor(),
          heartbeat: new Date(),
        },
      );

      await this.publishActiveUsers(namespace);
    });

    this.peerServer.on('disconnect', async client => {
      const [namespaceId] = client.getId().split('-');
      const namespace = await this.namespacesRepository.removeActiveUser(
        namespaceId,
        client.getId(),
      );

      await this.publishActiveUsers(namespace);
    });
  }

  onModuleInit(): void {
    this.httpServer.listen(9000, () => {
      console.log(`PeerJS server is running on 9000`);
    });
  }

  private generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';

    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
  }

  private async publishActiveUsers(namespace: Namespace): Promise<void> {
    if (namespace) {
      await this.pubsubService.publish('namespaceActiveUsers', {
        orgId: namespace.permissions.organizationId,
        namespaceId: namespace.id.toString(),
        activeUsers: namespace.activeUsers,
      });
    }
  }
}
