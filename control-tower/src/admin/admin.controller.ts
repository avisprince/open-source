import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AdminService } from '#src/admin/admin.service';
import { AuthStrategies } from '#src/auth/auth.constants';

export type DemoAccountConfig = {
  email: string;
  numDays: number;
};

@Controller('admin')
@UseGuards(AuthGuard(AuthStrategies.API_KEY))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/createDemoAccount')
  public async createDemoAccount(
    @Body() body: DemoAccountConfig,
  ): Promise<void> {
    await this.adminService.createDemoAccount(body);
  }

  @Post('/extendDemoAccount')
  public async extendDemoAccount(
    @Body() body: { organizationId: string; numDays: number },
  ): Promise<void> {
    await this.adminService.extendDemoAccount(
      body.organizationId,
      body.numDays,
    );
  }
}
