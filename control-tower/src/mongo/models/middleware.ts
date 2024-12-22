import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

export const stringifyMiddleware: FieldMiddleware = async (
  _ctx: MiddlewareContext,
  next: NextFn,
): Promise<string> => {
  const value = (await next()) || '';
  return typeof value === 'string' ? value : JSON.stringify(value);
};
