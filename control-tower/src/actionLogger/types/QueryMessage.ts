export type QueryMessage = {
  namespaceId: string;
  query: string;
  originItemId: string;
  databaseItemId: string;
  timestamp: string;
  queryTime?: number;
  rowsExamined?: number;
  rowsSent?: number;
};
