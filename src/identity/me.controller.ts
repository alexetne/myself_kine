import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../common/request-context';
import { AuthGuard } from './auth.guard';

@ApiTags('identity') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller('me')
export class MeController {
  @Get() get(@CurrentUser() user: AuthenticatedUser) { return { id: user.id, roles: user.roles }; }
}
