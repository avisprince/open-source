import { ActionQuery } from '#src/app.types';
import { IDatabaseQueryResult } from '#src/types/IDatabaseQueryResult';
import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class PostgresClient {
  public async queryDB(
    databaseQuery: ActionQuery,
  ): Promise<IDatabaseQueryResult[]> {
    const { connectionString, command } = databaseQuery;
    const connection = new Client(connectionString);
    const queries = command
      .split(';')
      .map(q => q.trim())
      .filter(q => !!q)
      .map(q => q + ';');
    const query = queries[queries.length - 1];

    try {
      await connection.connect();
      const result = await connection.query(query).then(r => r.rows);
      await connection.end();
      return [{ query, result }];
    } catch (err) {
      await connection.end();
      return [{ query, result: err.message }];
    }
  }
}
