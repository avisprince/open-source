import { HttpError } from '@kubernetes/client-node';
import { AxiosError } from 'axios';
import ErrorStackParser from 'error-stack-parser';
import fs from 'fs';
import { has, partialRight } from 'lodash/fp';
import path from 'path';

const addTraceFull = (message: string, trace: string) =>
  message + (trace ? ` \x1b[37m(${trace})` : '');

/**
 * If the message passed in is an Error, it should parse it properly.
 */
export function parseError(
  error: any,
  context: string | undefined,
  trace: string,
) {
  const addTrace = partialRight(addTraceFull, [trace]);

  if (error instanceof HttpError && has(['response', 'body'], error)) {
    const {
      body: { message, reason },
    } = error;

    return [addTrace(message), `${context}:${reason}`] as const;
  }

  if (error instanceof AxiosError && error.isAxiosError) {
    const { message } = error;

    if (error.response) {
      const {
        response: { data, status },
      } = error;
      return [addTrace(data), `${context}:${status}`] as const;
    }

    if (error.request) {
      return [addTrace(message), `${context}:NoResponse`] as const;
    }

    return [addTrace(message), `${context}:RequestFailed`] as const;
  }

  if (error instanceof Error) {
    const { message, name } = error;

    return [addTrace(message), `${context}:${name}`] as const;
  }

  return [addTrace(error), context] as const;
}

function rootPath(currentPath = process.cwd()): string {
  const packageJsonPath = path.join(currentPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    return currentPath;
  }
  return rootPath(path.join(currentPath, '..'));
}

export function getErrorTrace(error: Error | null): string | undefined {
  const filteredStack = [
    ...new Set([
      ...(error ? ErrorStackParser.parse(error) : []),
      ...ErrorStackParser.parse(new Error()),
    ]),
  ].filter(
    stackFrame =>
      !stackFrame.fileName.includes('node_modules') &&
      !stackFrame.fileName.includes('app.logger.ts') &&
      !stackFrame.fileName.includes('logger.utils.ts') &&
      !stackFrame.fileName.startsWith('node:'),
  );

  if (filteredStack.length === 0) {
    return undefined;
  }

  const stackFrame = filteredStack[0];
  const root = rootPath();
  const trace = stackFrame.fileName.replace(root, '');

  return `${trace}:${stackFrame.lineNumber}:${stackFrame.columnNumber}`;
}
