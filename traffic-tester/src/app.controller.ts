import { Action } from '#src/app.types';
import { MySQLClient } from '#src/dbClients/mysql.client';
import { PostgresClient } from '#src/dbClients/postgres.client';
import { All, Body, Controller, Get, Res } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly mysqlClient: MySQLClient,
    private readonly postgresClient: PostgresClient,
  ) {}

  @Get('/health')
  public health() {
    return 'OK';
  }

  @All('*')
  public async handleActions(
    @Body()
    {
      requests = [],
      response = {},
      queries = [],
      preRequestLogs = [],
      postRequestLogs = [],
    }: Action,
    @Res() res: Response,
  ): Promise<any> {
    (preRequestLogs ?? []).forEach(log => console.log(log));

    const queryResults = await Promise.all(
      queries.map(query => {
        switch (query.databaseType) {
          case 'mysql': {
            return this.mysqlClient.queryDB(query);
          }
          case 'postgres': {
            return this.postgresClient.queryDB(query);
          }
          default: {
            return null;
          }
        }
      }),
    );

    const results = await Promise.all(
      requests.map(async request => {
        const serviceRequest = axios.create({ baseURL: request.baseURL });

        try {
          const response = await serviceRequest(request);
          return response.data;
        } catch (err) {
          return {
            code: err.code,
            message: err.message,
          };
        }
      }),
    );

    (postRequestLogs ?? []).forEach(log => console.log(log));

    if (response.headers) {
      res.set(response.headers);
    }

    return res.status(response.status ?? 200).send(
      response.value ?? {
        queryResults,
        results,
      },
    );
  }
}
