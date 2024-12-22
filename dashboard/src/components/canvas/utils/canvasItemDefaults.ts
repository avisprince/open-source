import {
  IconDefinition,
  faCode,
  faDatabase,
  faDiamond,
  faGlobe,
  faMicrochip,
  faTrafficLight,
} from '@fortawesome/free-solid-svg-icons';
import { Dictionary } from 'lodash';

import { CanvasItemType } from 'src/components/canvas/Canvas';

const SERVICE_HEIGHT = 380;
const SERVICE_WIDTH = 432;
const DATABASE_HEIGHT = 208;
const DATABASE_WIDTH = 400;
const HTTP_REQUEST_HEIGHT = 724;
const HTTP_REQUEST_WIDTH = 456;
const MOCK_ENDPOINT_HEIGHT = 700;
const MOCK_ENDPOINT_WIDTH = 456;
const DB_QUERY_HEIGHT = 648;
const DB_QUERY_WIDTH = 432;
const TRAFFIC_HISTORY_HEIGHT = 136;
const TRAFFIC_HISTORY_WIDTH = 548;
const QUERY_HISTORY_HEIGHT = 136;
const QUERY_HISTORY_WIDTH = 548;

export function getCanvasItemDefaults(itemType: CanvasItemType) {
  switch (itemType) {
    case 'Service': {
      return {
        displayName: 'New Service',
        height: SERVICE_HEIGHT,
        width: SERVICE_WIDTH,
      };
    }
    case 'Database': {
      return {
        displayName: 'New Database',
        height: DATABASE_HEIGHT,
        width: DATABASE_WIDTH,
      };
    }
    case 'HttpRequest': {
      return {
        displayName: 'Http Request',
        height: HTTP_REQUEST_HEIGHT,
        width: HTTP_REQUEST_WIDTH,
      };
    }
    case 'MockEndpoint': {
      return {
        displayName: 'Mock Endpoint',
        height: MOCK_ENDPOINT_HEIGHT,
        width: MOCK_ENDPOINT_WIDTH,
      };
    }
    case 'DbQuery': {
      return {
        displayName: 'Database Query',
        height: DB_QUERY_HEIGHT,
        width: DB_QUERY_WIDTH,
      };
    }
    case 'TrafficHistory': {
      return {
        displayName: 'Traffic History',
        height: TRAFFIC_HISTORY_HEIGHT,
        width: TRAFFIC_HISTORY_WIDTH,
      };
    }
    case 'QueryHistory': {
      return {
        displayName: 'Query History',
        height: QUERY_HISTORY_HEIGHT,
        width: QUERY_HISTORY_WIDTH,
      };
    }
    default: {
      return {
        displayName: '',
        height: 0,
        width: 0,
      };
    }
  }
}

export const CanvasItemIcons: Dictionary<IconDefinition> = {
  Service: faMicrochip,
  Database: faDatabase,
  HttpRequest: faGlobe,
  MockEndpoint: faDiamond,
  DbQuery: faCode,
  TrafficHistory: faTrafficLight,
  QueryHistory: faTrafficLight,
};
