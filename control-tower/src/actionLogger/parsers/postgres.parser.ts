import { QueryMessage } from '#src/actionLogger/types/QueryMessage';

export function parseMessages(
  messages: Array<{ message: string }>,
  databaseItemId: string,
  namespaceId: string,
): QueryMessage[] {
  const queries: QueryMessage[] = [];

  messages
    .filter(({ message }) => message.includes('statement:'))
    .forEach(({ message }) => {
      const matches = message.match(
        /\[time=(.*)\]\[ip=(.*)\] LOG:\s*statement:\s*(.*)/,
      );
      if (matches && matches.length === 4) {
        queries.push({
          databaseItemId,
          namespaceId,
          query: matches[3],
          timestamp: matches[1],
          originItemId: matches[2],
        });
      }
    });

  return queries;
}
