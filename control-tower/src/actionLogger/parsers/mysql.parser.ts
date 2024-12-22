import { QueryMessage } from '#src/actionLogger/types/QueryMessage';

export function parseSlowLogs(
  messages: Array<{ message: string }>,
  databaseItemId: string,
  namespaceId: string,
): QueryMessage[] {
  const queries: QueryMessage[] = [];
  let query: Partial<QueryMessage> = {};

  messages.forEach(({ message }) => {
    if (message.startsWith('# Time:')) {
      if (query.query) {
        queries.push({
          ...query,
          databaseItemId,
          namespaceId,
        } as QueryMessage);

        query = {};
      }

      query.timestamp = message.substring(8);
    } else if (message.startsWith('# User')) {
      const matches = message.match(/# User@\w*:\s*[^@]+\s*@\s*\[(.*)\]/);
      if (matches) {
        query.originItemId = matches[1];
      }
    } else if (message.startsWith('# Query_time')) {
      const matches = message.match(
        /# Query_time:\s*(\d+\.\d+)\s*Lock_time: \d+\.\d+\s*Rows_sent: (\d+)\s*Rows_examined: (\d+)/,
      );
      if (matches) {
        query.queryTime = parseFloat(matches[1]);
        query.rowsSent = parseInt(matches[2]);
        query.rowsExamined = parseInt(matches[3]);
      }
    } else if (message.startsWith('#')) {
      return;
    } else if (message.startsWith('SET ')) {
      return;
    } else if (message.trim()) {
      query.query = query.query ? query.query + ' ' + message : message;
    }
  });

  return queries;
}
