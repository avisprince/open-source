import { AppController } from '#src/app.controller';
import { MySQLClient } from '#src/dbClients/mysql.client';
import { PostgresClient } from '#src/dbClients/postgres.client';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AppController],
  providers: [MySQLClient, PostgresClient],
})
export class AppModule {}
