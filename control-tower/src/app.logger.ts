import Bugsnag from '@bugsnag/js';
import { ConsoleLogger } from '@nestjs/common';

import { getErrorTrace, parseError } from '#src/logger.utils';

export class AppLogger extends ConsoleLogger {
  /**
   * Write a 'log' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   */
  log(thisMessage: any, thisContext?: string) {
    super.log(
      ...parseError(
        thisMessage,
        thisContext,
        getErrorTrace(thisMessage instanceof Error ? thisMessage : null),
      ),
    );
  }

  /**
   * Write an 'error' level log, if the configured level allows for it.
   * Prints to `stderr` with newline.
   */
  error(thisMessage: any, _stack?: string, thisContext?: string) {
    const [message, context] = parseError(
      thisMessage,
      thisContext,
      getErrorTrace(thisMessage instanceof Error ? thisMessage : null),
    );

    if (process.env.BUGSNAG_API_KEY) {
      Bugsnag.notify({
        name: context,
        message,
      });
    }

    super.error(message, undefined, context);
  }

  /**
   * Write a 'warn' level log, if the configured level allows for it.
   * Prints to `stdout` with newline.
   */
  warn(thisMessage: any, thisContext?: string) {
    super.log(
      ...parseError(
        thisMessage,
        thisContext,
        getErrorTrace(thisMessage instanceof Error ? thisMessage : null),
      ),
    );
  }
}
