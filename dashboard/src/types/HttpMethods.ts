import { Dictionary } from 'lodash';

export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS',
];

export const HTTP_METHOD_COLORS: Dictionary<string> = {
  GET: 'green',
  POST: 'yellow',
  PUT: 'yellow',
  DELETE: 'red',
  PATCH: 'yellow',
  HEAD: 'yellow',
  OPTIONS: 'yellow',
  PURGE: 'red',
  LINK: 'yellow',
  UNLINK: 'red',
};

export const HTTP_METHOD_NAMES: Dictionary<string> = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DEL',
  PATCH: 'PAT',
  HEAD: 'HEAD',
  OPTIONS: 'OPT',
  PURGE: 'PUR',
  LINK: 'LINK',
  UNLINK: 'UNL',
};

export const getStatusCodeColor = (statusCode: number | null) => {
  if (!statusCode) {
    return 'yellow';
  }

  if (statusCode >= 400) {
    return 'red';
  }

  if (statusCode >= 300) {
    return 'blue';
  }

  if (statusCode >= 200) {
    return 'green';
  }

  return 'yellow';
};
