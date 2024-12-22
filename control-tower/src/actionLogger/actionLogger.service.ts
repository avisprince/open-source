import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { IConsoleLog } from '#src/actionLogger/dtos/IConsoleLog';
import { parseSlowLogs } from '#src/actionLogger/parsers/mysql.parser';
import { parseMessages } from '#src/actionLogger/parsers/postgres.parser';
import { QueryMessage } from '#src/actionLogger/types/QueryMessage';
import { KubernetesService } from '#src/kubernetes/kubernetes.service';
import { Action, ConsoleLog, QueryLog } from '#src/mongo/models';
import { NamespacesRepository } from '#src/mongo/repositories';
import { NamespacesService } from '#src/namespaces/namespaces.service';
import { PubSubService } from '#src/pubsub/pubsub.service';
import { SUPPORTED_DATABASES } from '#src/types/database.types';

@Injectable()
export class ActionLoggerService {
  constructor(
    private readonly namespacesRepository: NamespacesRepository,
    private readonly pubsubService: PubSubService,
    private readonly kubernetesService: KubernetesService,
    private readonly namespacesService: NamespacesService,
  ) {}

  public async logAction(action: Action): Promise<void> {
    action.id = action.id || uuid();
    action.trafficType = 'Action';

    await this.namespacesService.logAction(action.namespace, action);
    await this.pubsubService.publish('actionLogged', action);
  }

  public async logConsole(logs: IConsoleLog[]): Promise<void> {
    await Promise.all(
      logs.map(async ({ logFile, message, namespaceId }) => {
        // logFile Format => dokkimi.var.log.containers.<serviceName>-pod-<namespace>-*.log
        const itemId = logFile.split('-')[0].split('.')[4];
        const splitMessage = message.includes(' stdout F ')
          ? message.split(' stdout F ')
          : message.split(' stderror F ');
        const timestamp = Math.floor(
          new Date(splitMessage[0]).getTime() / 1000,
        );

        const consoleLog = {
          itemId,
          message: splitMessage[1] + '\n',
          timestamp,
        };

        await this.namespacesRepository.addConsoleLog(namespaceId, consoleLog);
        await this.pubsubService.publish('consoleLogged', {
          namespaceId,
          consoleLog,
        });
      }),
    );
  }

  public async logConsoleDev(logs: IConsoleLog[]): Promise<void> {
    await Promise.all(
      logs.map(async ({ logFile, log: message, namespaceId }) => {
        // logFile Format => dokkimi.var.log.containers.<serviceName>-pod-<namespace>-*.log
        const itemId = logFile.split('-')[0].split('.')[4];
        const consoleLog: ConsoleLog = {
          itemId,
          message,
          timestamp: Date.now(),
        };

        await this.namespacesRepository.addConsoleLog(namespaceId, consoleLog);
        await this.pubsubService.publish('consoleLogged', {
          namespaceId,
          consoleLog,
        });
      }),
    );
  }

  public async logQuery(
    messages: Array<{ message: string }>,
    namespaceId: string,
    itemId: string,
    databaseType: SUPPORTED_DATABASES,
  ): Promise<void> {
    let queries: QueryMessage[] = [];

    if (databaseType === SUPPORTED_DATABASES.MYSQL) {
      queries = parseSlowLogs(messages, itemId, namespaceId);
    } else if (databaseType === SUPPORTED_DATABASES.POSTGRES) {
      queries = parseMessages(messages, itemId, namespaceId);
    }

    await Promise.all(
      queries.map(async query => {
        const originItemId = await this.kubernetesService.getItemIdFromIp(
          namespaceId,
          query.originItemId,
        );

        const namespace = await this.namespacesRepository.findById(namespaceId);
        const hasOriginItem = namespace.items.some(
          item => item.itemId === originItemId,
        );

        if (!originItemId || !hasOriginItem) {
          return null;
        }

        const queryLog: QueryLog = {
          ...query,
          trafficType: 'Query',
          queryId: uuid(),
          databaseType,
          originItemId,
        };

        await this.namespacesService.logQuery(namespaceId, queryLog);
        await this.pubsubService.publish('queryLogged', {
          namespaceId,
          queryLog,
        });
      }),
    );
  }
}
