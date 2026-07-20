import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DatabaseService } from './infrastructure/database/database.service';

@ApiTags('operations') @Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}
  @Get('live') live() { return { status: 'ok' }; }
  @Get('ready') async ready() { await this.database.query('SELECT 1'); return { status: 'ok' }; }
}
