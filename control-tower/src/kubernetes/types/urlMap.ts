import { Dictionary } from 'lodash';

type ServiceInfo = {
  scheme: 'http' | 'https';
  url: string;
  name: string;
};

export type UrlMap = Dictionary<ServiceInfo>;
