import {
  IconDefinition,
  faCode,
  faDatabase,
  faDiamond,
  faGlobe,
  faMicrochip,
} from '@fortawesome/free-solid-svg-icons';

export type TemplateType =
  | 'Service'
  | 'Database'
  | 'HttpRequest'
  | 'MockEndpoint'
  | 'DbQuery';

export const TemplateIcons: Record<TemplateType, IconDefinition> = {
  Service: faMicrochip,
  Database: faDatabase,
  HttpRequest: faGlobe,
  MockEndpoint: faDiamond,
  DbQuery: faCode,
};
