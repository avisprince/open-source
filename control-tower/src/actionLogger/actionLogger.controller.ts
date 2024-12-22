import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ActionLoggerService } from '#src/actionLogger/actionLogger.service';
import { IConsoleLog } from '#src/actionLogger/dtos/IConsoleLog';
import { AuthStrategies } from '#src/auth/auth.constants';
import { BOOLEAN } from '#src/constants/environment.constants';
import { Action } from '#src/mongo/models';

@Controller('actions')
@UseGuards(AuthGuard(AuthStrategies.API_KEY))
export class ActionLoggerController {
  constructor(private readonly actionLoggerService: ActionLoggerService) {}

  @Post('logAction')
  public async logAction(@Body() body: Action): Promise<void> {
    await this.actionLoggerService.logAction(body);
  }

  @Post('logConsole')
  public async postLog(@Body() body: IConsoleLog[]): Promise<void> {
    process.env.USE_LOCAL_CLUSTER === BOOLEAN.TRUE
      ? await this.actionLoggerService.logConsoleDev(body)
      : await this.actionLoggerService.logConsole(body);
  }

  @Post('logQuery')
  public logQuery(
    @Req() request,
    @Body() body: Array<{ message: string }>,
  ): void {
    const { itemid, namespaceid, databasetype } = request.headers;
    this.actionLoggerService.logQuery(body, namespaceid, itemid, databasetype);
  }
}
