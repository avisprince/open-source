import { Method } from 'axios';

export type ActionQuery = {
  databaseType: string;
  connectionString: string;
  command: string;
};

export type ActionRequest = {
  baseURL: string;
  url: string;
  method: Method;
  headers?: any;
  data: Action;
};

export type ActionResponse = {
  headers?: object;
  status?: number;
  value?: any;
};

export type Action = {
  preRequestLogs?: string[];
  requests?: ActionRequest[];
  queries?: ActionQuery[];
  postRequestLogs?: string[];
  response?: ActionResponse;
};
