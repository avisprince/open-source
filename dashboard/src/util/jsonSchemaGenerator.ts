import {
  Dictionary,
  isArray,
  isBoolean,
  isInteger,
  isNull,
  isNumber,
  isObject,
  isString,
} from 'lodash';

type JSONValue = JSONScalar | JSONObject | JSONArray | object | null;
type JSONScalar = string | number | boolean;
interface JSONObject extends Dictionary<JSONValue> {}
interface JSONArray extends Array<JSONValue> {}

interface JSONSchemaValue {}

interface JSONSchemaScalar extends JSONSchemaValue {
  type: string;
}

interface JSONSchemaArray extends JSONSchemaValue {
  type: 'array';
  items: Array<JSONSchemaScalar | JSONSchemaArray | JSONSchemaObject>;
}

interface JSONSchemaObject extends JSONSchemaValue {
  type: 'object';
  properties?: Dictionary<JSONSchema>;
  required?: string[];
}

type JSONSchema = JSONSchemaScalar | JSONSchemaArray | JSONSchemaObject;

function isScalar(val: any): boolean {
  return isNumber(val) || isBoolean(val) || isString(val);
}

export function generateSchema(json: JSONValue): JSONSchema {
  if (isNull(json)) {
    return {
      type: 'null',
    };
  }

  if (isScalar(json)) {
    return {
      type: isInteger(json) ? 'integer' : typeof json,
    };
  }

  if (isArray(json)) {
    return {
      type: 'array',
      items: json.map(val => generateSchema(val)),
    };
  }

  if (isObject(json)) {
    const schema: JSONSchemaObject = {
      type: 'object',
      properties: Object.entries(json).reduce<Dictionary<JSONSchema>>(
        (agg, [key, val]) => {
          agg[key] = generateSchema(val);
          return agg;
        },
        {},
      ),
      required: Object.keys(json),
    };

    if (schema.required?.length === 0) {
      delete schema.required;
      delete schema.properties;
    }

    return schema;
  }

  // Should never get here
  throw new Error(`Unknown data type: ${JSON.stringify(json)}`);
}
