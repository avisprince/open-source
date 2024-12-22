import { Module } from '@nestjs/common';

import { AuthModule } from '#src/auth/auth.module';
import { UserResolver } from '#src/users/user.resolver';
import { UserService } from '#src/users/user.service';

@Module({
  imports: [AuthModule],
  providers: [UserResolver, UserService],
})
export class UserModule {}
