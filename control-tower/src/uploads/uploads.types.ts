import { HealthStatus } from '#src/mongo/models';
import { SUPPORTED_DATABASES } from '#src/types/database.types';

export type InitFileCustomization = {
  newName: string;
  database: SUPPORTED_DATABASES.MYSQL | SUPPORTED_DATABASES.POSTGRES;
};

export type PodStatus = {
  name: string;
  status?: HealthStatus;
  cpu?: number;
  memory?: number;
  timestamp?: string;
};

export type NamespaceUsageFile = {
  namespaceId: string;
  status: HealthStatus;
  history: Record<string, PodStatus>[];
  lastUpdated: string;
};
