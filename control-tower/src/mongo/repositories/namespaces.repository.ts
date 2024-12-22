import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType, QueryOptions } from 'mongoose';
import { v4 as uuid } from 'uuid';

import {
  Action,
  ActiveUser,
  ConsoleLog,
  Namespace,
  NamespaceDocument,
  NamespaceItem,
  TestCase,
} from '#src/mongo/models';
import { NamespaceTraffic } from '#src/mongo/models/namespaceTraffic/namespaceTraffic.interface';
import {
  NamespaceInput,
  NamespaceItemInputType,
  NamespaceItemPositionInput,
} from '#src/resolverInputs/namespaces.input';
import { MongoID } from '#src/types/mongo.types';

@Injectable()
export class NamespacesRepository {
  constructor(
    @InjectModel(Namespace.name)
    private readonly namespaceModel: Model<NamespaceDocument>,
  ) {}

  public create(namespace: Partial<Namespace>): Promise<Namespace> {
    return this.namespaceModel.create(
      this.pruneNamespaceFields(namespace as Partial<Namespace>),
    );
  }

  public findById(id: MongoID | string): Promise<Namespace> {
    return this.namespaceModel
      .findById(id)
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public find(
    filter: FilterQuery<NamespaceDocument>,
    projection?: ProjectionType<NamespaceDocument> | null | undefined,
    options?: QueryOptions<NamespaceDocument> | null | undefined,
  ): Promise<Namespace[]> {
    return this.namespaceModel
      .find(filter, projection, options)
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public update(
    id: MongoID,
    namespace: NamespaceInput | Partial<Namespace>,
  ): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(
        id,
        this.pruneNamespaceFields(namespace as Partial<Namespace>),
        {
          new: true,
        },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public addTraffic(
    namespaceId: MongoID | string,
    traffic: NamespaceTraffic,
  ): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(namespaceId, {
        $push: {
          traffic: {
            $each: [traffic],
            $position: 0,
          },
        },
      })
      .exec();
  }

  public addConsoleLog(
    namespaceId: MongoID | string,
    consoleLog: ConsoleLog,
  ): Promise<Namespace> {
    return this.namespaceModel
      .findOneAndUpdate(
        {
          _id: namespaceId,
          'items.itemId': consoleLog.itemId,
        },
        {
          $push: {
            'items.$.consoleLogs': consoleLog,
          },
        },
        { new: true },
      )
      .exec();
  }

  public async addItem(
    namespaceId: MongoID | string,
    item: Partial<NamespaceItem>,
  ): Promise<NamespaceItem> {
    const itemId = `d${uuid().split('-')[0]}`;
    const namespace = await this.namespaceModel
      .findByIdAndUpdate(
        namespaceId,
        {
          $push: {
            items: {
              ...item,
              itemId,
            },
          },
        },
        { new: true },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();

    return namespace.items.find(item => item.itemId === itemId);
  }

  public async updateItem(
    namespaceId: MongoID,
    item: NamespaceItemInputType,
  ): Promise<Namespace> {
    const set = Object.entries(item).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [`items.$.${key}`]: value,
      };
    }, {});

    return this.namespaceModel
      .findOneAndUpdate(
        {
          _id: namespaceId,
          'items.itemId': item.itemId,
        },
        {
          $set: set,
        },
        { new: true },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public async updateItemPosition(
    namespaceId: MongoID,
    itemPosition: NamespaceItemPositionInput,
  ): Promise<NamespaceItem> {
    const namespace = await this.namespaceModel
      .findOneAndUpdate(
        {
          _id: namespaceId,
          'items.itemId': itemPosition.itemId,
        },
        {
          $set: {
            'items.$.canvasInfo.posX': itemPosition.canvasInfo.posX,
            'items.$.canvasInfo.posY': itemPosition.canvasInfo.posY,
          },
        },
        { new: true },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();

    return namespace.items.find(item => item.itemId === itemPosition.itemId);
  }

  public deleteItem(namespaceId: MongoID, itemId: string): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(
        namespaceId,
        {
          $pull: {
            items: { itemId },
          },
        },
        { new: true },
      )
      .exec();
  }

  public async addActiveUser(
    namespaceId: MongoID | string,
    user: ActiveUser,
  ): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(
        namespaceId,
        {
          $push: {
            activeUsers: user,
          },
        },
        { new: true },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public updateActiveUserHeartbeat(
    namespaceId: MongoID,
    peerId: string,
  ): Promise<Namespace> {
    return this.namespaceModel.findOneAndUpdate(
      {
        _id: namespaceId,
        'activeUsers.peerId': peerId,
      },
      {
        $set: {
          'activeUsers.$.heartbeat': new Date(),
        },
      },
      { new: true },
    );
  }

  public removeActiveUser(
    namespaceId: MongoID | string,
    peerId: string,
  ): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(
        namespaceId,
        {
          $pull: {
            activeUsers: { peerId },
          },
        },
        { new: true },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public updateLastUsed(namespaceId: MongoID | string): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(
        namespaceId,
        {
          lastUsedAt: new Date(),
        },
        { new: true },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public async findAction(
    namespaceId: MongoID,
    actionId: string,
  ): Promise<Action> {
    const namespace = await this.namespaceModel
      .findOne({ _id: namespaceId, 'traffic.id': actionId })
      .exec();

    return namespace.traffic.find(
      a => a.trafficType === 'Action' && (a as Action).id === actionId,
    ) as Action;
  }

  public delete(id: MongoID): Promise<Namespace> {
    return this.namespaceModel.findByIdAndDelete(id).exec();
  }

  public archive(id: MongoID): Promise<Namespace> {
    return this.namespaceModel.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );
  }

  public clearNamespaceTraffic(namespaceId: MongoID): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(
        namespaceId,
        {
          traffic: [],
        },
        {
          new: true,
        },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public createTestCase(
    namespaceId: MongoID,
    testCase: Partial<TestCase>,
  ): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(
        namespaceId,
        {
          $push: {
            testCases: {
              id: uuid(),
              ...testCase,
            },
          },
        },
        {
          new: true,
        },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public updateTestCase(
    namespaceId: MongoID,
    testCase: TestCase,
  ): Promise<Namespace> {
    return this.namespaceModel
      .findOneAndUpdate(
        {
          _id: namespaceId,
          'testCases.id': testCase.id,
        },
        {
          $set: {
            'testCases.$': testCase,
          },
        },
        { new: true },
      )
      .populate(this.populateService())
      .populate(this.populateDatabase())
      .populate(this.populateActiveUsers())
      .exec();
  }

  public deleteTestCase(
    namespaceId: MongoID,
    testCaseId: string,
  ): Promise<Namespace> {
    return this.namespaceModel
      .findByIdAndUpdate(
        namespaceId,
        {
          $pull: {
            testCases: { id: testCaseId },
          },
        },
        { new: true },
      )
      .exec();
  }

  private pruneNamespaceFields(
    namespace: Partial<Namespace>,
  ): Partial<Namespace> {
    return {
      ...namespace,
      activeUsers: [],
    };
  }

  private populateService() {
    return {
      path: 'items',
      populate: [
        {
          path: 'dockerRegistrySecret',
          model: 'DockerRegistrySecret',
        },
      ],
    };
  }

  private populateDatabase() {
    return {
      path: 'items',
      populate: [
        {
          path: 'initFile',
          model: 'Upload',
        },
      ],
    };
  }

  private populateActiveUsers() {
    return {
      path: 'activeUsers',
      populate: [
        {
          path: 'user',
          model: 'User',
        },
      ],
    };
  }
}
