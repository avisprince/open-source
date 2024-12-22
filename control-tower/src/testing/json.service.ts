import { Injectable } from '@nestjs/common';
import {
  isArray,
  isBoolean,
  isNull,
  isNumber,
  isObject,
  isString,
} from 'lodash';

import { ValidationError } from '#src/mongo/models';
import {
  JSONSchema,
  JSONSchemaArray,
  JSONSchemaObject,
  JSONSchemaScalar,
  ValidationStatus,
} from '#src/types/json.schema.types';
import {
  JSONArray,
  JSONObject,
  JSONScalar,
  JSONValue,
} from '#src/types/json.types';

@Injectable()
export class JSONService {
  public generateSchema(json: JSONValue, path: string[] = []): JSONSchema {
    if (isNull(json)) {
      return {
        type: 'null',
        validationStatus: ValidationStatus.EXISTS,
        value: null,
        path,
      };
    }

    if (this.isScalar(json)) {
      return {
        type: typeof json,
        validationStatus: ValidationStatus.EXISTS,
        value: json as JSONScalar,
        path,
      };
    }

    if (isArray(json)) {
      return {
        type: 'array',
        validationStatus: ValidationStatus.EXISTS,
        items: json.map((val, index) =>
          this.generateSchema(val, [...path, index.toString()]),
        ),
        path,
      };
    }

    if (isObject(json)) {
      return {
        type: 'object',
        validationStatus: ValidationStatus.EXISTS,
        properties: Object.keys(json).reduce((agg, key) => {
          agg[key] = this.generateSchema(json[key], [...path, key]);
          return agg;
        }, {}),
        required: Object.keys(json),
        path,
      };
    }

    // Should never get here
    throw new Error(`Unknown data type: ${JSON.stringify(json)}`);
  }

  public updateSchemaValidationStatus(
    schema: JSONSchema,
    path: string[],
    validationStatus: ValidationStatus,
  ): void {
    if (path.length === 0) {
      schema.validationStatus = validationStatus;
    } else {
      const key = path.shift();
      if (schema.type === 'object') {
        this.updateSchemaValidationStatus(
          (schema as JSONSchemaObject).properties[key],
          path,
          validationStatus,
        );
      } else if (schema.type === 'array') {
        this.updateSchemaValidationStatus(
          (schema as JSONSchemaArray).items[key],
          path,
          validationStatus,
        );
      }
    }
  }

  public validateJSON(json: JSONValue, schema: JSONSchema): ValidationError[] {
    if (schema.validationStatus === ValidationStatus.OPTIONAL) {
      return [];
    }

    if (isNull(json)) {
      this.validateNull(schema);
    }

    if (this.isScalar(json)) {
      return this.validateJSONScalar(
        json as JSONScalar,
        schema as JSONSchemaScalar,
      );
    }

    if (isArray(json)) {
      // Makes a recursive call to validateJSON
      return this.validateJSONArray(json, schema as JSONSchemaArray);
    }

    if (isObject(json)) {
      // Makes a recursive call to validateJSON
      return this.validateJSONObject(
        json as JSONObject,
        schema as JSONSchemaObject,
      );
    }

    // Should never get here
    throw new Error(`Unknown data type: ${JSON.stringify(json)}`);
  }

  private isScalar(val: any): boolean {
    return isNumber(val) || isBoolean(val) || isString(val);
  }

  private validateNull(schema: JSONSchema): ValidationError[] {
    if (schema.validationStatus === ValidationStatus.NOT_NULL) {
      return [
        {
          path: schema.path,
          message: 'Value should not be null.',
        },
      ];
    }

    return [];
  }

  private validateJSONScalar(
    json: JSONScalar,
    schema: JSONSchemaScalar,
  ): ValidationError[] {
    if (typeof json !== schema.type) {
      return [
        {
          path: schema.path,
          message: `Types are not equal. Expected: ${
            schema.type
          }. Actual: ${typeof json}`,
        },
      ];
    }

    if (
      schema.validationStatus === ValidationStatus.VALUE &&
      json !== schema.value
    ) {
      return [
        {
          path: schema.path,
          message: `Values are not equal. Expected: ${schema.value}. Actual: ${json}.`,
        },
      ];
    }

    return [];
  }

  private validateJSONArray(
    json: JSONArray,
    schema: JSONSchemaArray,
  ): ValidationError[] {
    if (schema.type !== 'array') {
      return [
        {
          path: schema.path,
          message: `Types are not equal. Expected: ${schema.type}. Actual: array.`,
        },
      ];
    }

    if (json.length !== schema.items.length) {
      return [
        {
          path: schema.path,
          message: `Array lengths are not equal. Expected: ${schema.items.length}. Actual: ${json.length}.`,
        },
      ];
    }

    return json.flatMap((item, index) =>
      this.validateJSON(item, schema.items[index]),
    );
  }

  private validateJSONObject(
    json: JSONObject,
    schema: JSONSchemaObject,
  ): ValidationError[] {
    if (typeof json !== schema.type) {
      return [
        {
          path: schema.path,
          message: `Types are not equal. Expected: ${schema.type}. Actual: object`,
        },
      ];
    }

    return schema.required.flatMap(key => {
      const jsonValue = json[key];

      if (jsonValue === undefined) {
        return [
          {
            path: schema.path,
            message: `Missing required key: ${key}.`,
          },
        ];
      }

      return this.validateJSON(jsonValue, schema.properties[key]);
    });
  }
}
