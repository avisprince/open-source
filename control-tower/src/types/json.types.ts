import { Dictionary } from 'lodash';

export type JSONValue = JSONScalar | JSONObject | JSONArray | object | null;
export type JSONScalar = string | number | boolean;
export interface JSONObject extends Dictionary<JSONValue> {}
export interface JSONArray extends Array<JSONValue> {}
