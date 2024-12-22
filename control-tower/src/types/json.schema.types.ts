import { Dictionary } from 'lodash';

export enum ValidationStatus {
  EXISTS = 'exists',
  VALUE = 'value',
  NOT_NULL = 'not null',
  OPTIONAL = 'optional',
}

interface JSONSchemaValue {
  validationStatus: ValidationStatus;
  path: string[];
}

export interface JSONSchemaScalar extends JSONSchemaValue {
  type: string;
  value: string | number | boolean | null;
}

export interface JSONSchemaArray extends JSONSchemaValue {
  type: 'array';
  items: Array<JSONSchemaScalar | JSONSchemaArray | JSONSchemaObject>;
}

export interface JSONSchemaObject extends JSONSchemaValue {
  type: 'object';
  properties: Dictionary<JSONSchemaScalar | JSONSchemaArray | JSONSchemaObject>;
  required: string[];
}

export type JSONSchema = JSONSchemaScalar | JSONSchemaArray | JSONSchemaObject;
