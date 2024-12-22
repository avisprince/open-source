import { JSONSchema, ValidationStatus } from '#src/types/json.schema.types';
import { Test } from '@nestjs/testing';
import { JSONService } from './json.service';

describe('AssertionsService', () => {
  let jsonService: JSONService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [JSONService],
    }).compile();

    jsonService = module.get<JSONService>(JSONService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('generateSchema', () => {
    it('should generate schema for a string', () => {
      const json = 'test';
      const schema = jsonService.generateSchema(json);

      expect(schema).toEqual({
        type: 'string',
        validationStatus: ValidationStatus.EXISTS,
        value: json,
        path: [],
      });
    });

    it('should generate schema for complex objects', () => {
      const json = {
        foo: 'bar',
        hello: [
          'avi',
          {
            lastName: 'prince',
          },
          32,
        ],
      };
      const expectedSchema = {
        type: 'object',
        path: [],
        properties: {
          foo: {
            type: 'string',
            value: 'bar',
            path: ['foo'],
            validationStatus: ValidationStatus.EXISTS,
          },
          hello: {
            type: 'array',
            path: ['hello'],
            items: [
              {
                type: 'string',
                value: 'avi',
                path: ['hello', '0'],
                validationStatus: ValidationStatus.EXISTS,
              },
              {
                type: 'object',
                properties: {
                  lastName: {
                    type: 'string',
                    value: 'prince',
                    validationStatus: ValidationStatus.EXISTS,
                    path: ['hello', '1', 'lastName'],
                  },
                },
                required: ['lastName'],
                validationStatus: ValidationStatus.EXISTS,
                path: ['hello', '1'],
              },
              {
                type: 'number',
                value: 32,
                validationStatus: ValidationStatus.EXISTS,
                path: ['hello', '2'],
              },
            ],
            validationStatus: ValidationStatus.EXISTS,
          },
        },
        validationStatus: ValidationStatus.EXISTS,
        required: ['foo', 'hello'],
      };

      const schema = jsonService.generateSchema(json);
      expect(schema).toEqual(expectedSchema);
    });
  });

  describe('validateJSON', () => {
    it('should handle complex objects', () => {
      const json = {
        foo: 'bar',
        hello: [
          'avi',
          {
            lastName: 'prince',
          },
          32,
        ],
      };
      const schema: JSONSchema = {
        type: 'object',
        path: [],
        properties: {
          foo: {
            type: 'string',
            value: 'bar',
            path: ['foo'],
            validationStatus: ValidationStatus.EXISTS,
          },
          hello: {
            type: 'array',
            path: ['hello'],
            items: [
              {
                type: 'string',
                value: 'avi',
                path: ['hello', '0'],
                validationStatus: ValidationStatus.EXISTS,
              },
              {
                type: 'object',
                properties: {
                  lastName: {
                    type: 'string',
                    value: 'prince',
                    validationStatus: ValidationStatus.EXISTS,
                    path: ['hello', '1', 'lastName'],
                  },
                },
                required: ['lastName'],
                validationStatus: ValidationStatus.EXISTS,
                path: ['hello', '1'],
              },
              {
                type: 'number',
                value: 32,
                validationStatus: ValidationStatus.EXISTS,
                path: ['hello', '2'],
              },
            ],
            validationStatus: ValidationStatus.EXISTS,
          },
        },
        validationStatus: ValidationStatus.EXISTS,
        required: ['foo', 'hello'],
      };

      const errors = jsonService.validateJSON(json, schema);

      expect(errors.length).toEqual(0);
    });
  });
});
