import { HttpStatus, Injectable } from '@nestjs/common';
import axios, { Method } from 'axios';

import { CloudStatus } from '#src/constants/cloudStatus.constants';
import {
  DB_PROXY_ENDPOINT,
  INTERCEPTOR_PROXY_ENDPOINT,
  PROXY_SERVICE_NAME,
} from '#src/constants/route.constants';
import {
  calculateUrlMap,
  getClusterBaseUrl,
} from '#src/kubernetes/builders/utils/kubernetes.util';
import { MockEndpoint, Namespace, NamespaceItemId } from '#src/mongo/models';
import { NamespacesRepository } from '#src/mongo/repositories';
import { DatabaseQueryResultOutput } from '#src/resolverOutputs/databaseQueryResult.output';
import { HttpRequestResultOutput } from '#src/resolverOutputs/httpRequestResult.output';
import { MongoID } from '#src/types/mongo.types';
import safeJSONparse from '#src/utils/safeJSONParse';

@Injectable()
export class KubernetesClient {
  constructor(private readonly namespacesRepository: NamespacesRepository) {}

  public async sendRequest(
    namespaceId: MongoID,
    itemId: NamespaceItemId,
  ): Promise<HttpRequestResultOutput> {
    const { httpRequests } = await this.namespacesRepository.findById(
      namespaceId,
    );
    const httpRequest = httpRequests.find(request => request.itemId === itemId);
    if (!httpRequest) {
      throw new Error('Could not find Http Request');
    }

    const { target, path, method, headers, body } = httpRequest;

    console.log('httpRequest', httpRequest);

    return this.performHttpRequest(
      namespaceId,
      target,
      path,
      method,
      headers,
      body,
    );
  }

  public async resendAction(
    namespaceId: MongoID,
    actionRequestId: string,
  ): Promise<HttpRequestResultOutput> {
    const { actions } = await this.namespacesRepository.findById(namespaceId);

    const action = actions.find(
      action => action.id === actionRequestId && action.type === 'request',
    );

    if (!action) {
      throw new Error('Could not find Http Request');
    }

    const { target, url, method, headers, body } = action;

    return this.performHttpRequest(
      namespaceId,
      target,
      url,
      method,
      headers,
      body,
    );
  }

  public async performHttpRequest(
    namespaceId: MongoID,
    itemId: NamespaceItemId,
    path: string,
    method: string,
    headers: any,
    body: any,
  ): Promise<HttpRequestResultOutput> {
    await this.namespacesRepository.updateLastUsed(namespaceId);

    try {
      const baseURL = getClusterBaseUrl();
      const serviceRequest = axios.create({ baseURL });

      console.log('request to proxy service');
      console.log({
        baseURL,
        method: method as Method,
        url: `/${namespaceId}/${itemId}${path || '/'}`,
        headers: safeJSONparse(headers, {}),
        data: safeJSONparse(body, {}),
      });

      const response = await serviceRequest({
        method: method as Method,
        url: `/${namespaceId}/${itemId}${path || '/'}`,
        headers: safeJSONparse(headers, {}),
        data: safeJSONparse(body, {}),
      });

      // Only return necessary values or we will crash with recursive JSON
      return {
        data: response.data,
        headers: response.headers,
        status: response.status,
      };
    } catch (err) {
      // If the status is an error status, it's not actually an error
      if (err.response) {
        return {
          data: err.response.data,
          headers: err.response.headers,
          status: err.response.status,
        };
      }

      return {
        data: err.message,
        headers: {},
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  public async resendQuery(
    namespaceId: MongoID,
    queryId: string,
  ): Promise<DatabaseQueryResultOutput[]> {
    const { queries, databases } = await this.namespacesRepository.findById(
      namespaceId,
    );
    const query = queries.find(query => query.queryId === queryId);
    if (!query) {
      throw new Error('Could not find Http Request');
    }

    const targetDB = databases.find(
      database => database.itemId === query.databaseItemId,
    );
    if (!targetDB) {
      throw new Error('Target DB not found');
    }

    const baseURL = getClusterBaseUrl();

    return (
      await axios.request<DatabaseQueryResultOutput[]>({
        url: `${baseURL}/${PROXY_SERVICE_NAME}/${DB_PROXY_ENDPOINT}/${namespaceId}/query`,
        method: 'POST',
        headers: {
          ApiKey: process.env.API_KEY,
        },
        data: {
          database: targetDB.database,
          dbName: targetDB.itemId,
          command: query,
        },
      })
    ).data;
  }

  public async sendDbQuery(
    namespaceId: MongoID,
    itemId: NamespaceItemId,
  ): Promise<DatabaseQueryResultOutput[]> {
    await this.namespacesRepository.updateLastUsed(namespaceId);

    const { dbQueries, databases } = await this.namespacesRepository.findById(
      namespaceId,
    );

    const dbQuery = dbQueries.find(item => item.itemId === itemId);
    if (!dbQuery) {
      throw new Error('Could not find DbQuery');
    }

    const { target, query, useDatabase } = dbQuery;
    const targetDB = databases.find(db => db.itemId === target);
    if (!targetDB) {
      throw new Error('Target database not found');
    }

    const baseURL = getClusterBaseUrl();

    const response = (
      await axios.request<DatabaseQueryResultOutput[]>({
        url: `${baseURL}/${PROXY_SERVICE_NAME}/${DB_PROXY_ENDPOINT}/${namespaceId}/query`,
        method: 'POST',
        headers: {
          ApiKey: process.env.API_KEY,
        },
        data: {
          database: targetDB.database,
          dbName: targetDB.itemId,
          command: query,
          useDatabase,
        },
      })
    ).data;

    if (response === null) {
      return [
        {
          query,
          result: null,
        },
      ];
    }

    return response;
  }

  public async updateProxyServiceUrlMap(namespace: Namespace): Promise<void> {
    if (namespace.status !== CloudStatus.ACTIVE) {
      return;
    }

    const baseURL = getClusterBaseUrl();
    const urlMap = calculateUrlMap(namespace);

    try {
      await axios.request({
        url: `${baseURL}/${PROXY_SERVICE_NAME}/${INTERCEPTOR_PROXY_ENDPOINT}/${namespace.id}/urlMap`,
        method: 'POST',
        headers: {
          ApiKey: process.env.API_KEY,
        },
        data: urlMap,
      });
    } catch (err) {
      // Nothing to do here. Most likely the proxy service isnt online yet
    }
  }

  public async updateMockEndpoints(namespace: Namespace): Promise<void> {
    const baseURL = getClusterBaseUrl();

    await axios.request({
      url: `${baseURL}/${PROXY_SERVICE_NAME}/${INTERCEPTOR_PROXY_ENDPOINT}/${namespace.id}/mockEndpoints`,
      method: 'POST',
      headers: {
        ApiKey: process.env.API_KEY,
      },
      data: namespace.mockEndpoints.filter(mock => mock.errors.length === 0),
    });
  }

  public async getMockEndpoints(namespaceId: MongoID): Promise<MockEndpoint[]> {
    const { status } = await this.namespacesRepository.findById(namespaceId);

    if (status === CloudStatus.INACTIVE) {
      return [];
    }

    try {
      const baseURL = getClusterBaseUrl();
      const { data: mockEndpoints } = await axios.request<MockEndpoint[]>({
        url: `${baseURL}/${PROXY_SERVICE_NAME}/${INTERCEPTOR_PROXY_ENDPOINT}/${namespaceId}/mockEndpoints`,
        method: 'GET',
        headers: {
          ApiKey: process.env.API_KEY,
        },
      });

      return mockEndpoints;
    } catch {
      return [];
    }
  }
}
