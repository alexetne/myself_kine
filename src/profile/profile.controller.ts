import { Body, Controller, Get, Headers, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '../common/request-context';
import { AuthGuard } from '../identity/auth.guard';
import { UpsertProfileDto } from './profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile') @ApiBearerAuth() @UseGuards(AuthGuard) @Controller('me/profile')
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}
  @Get() @ApiOkResponse() get(@CurrentUser() user: AuthenticatedUser) { return this.profiles.get(user.id); }
  @Put() @ApiOkResponse() put(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertProfileDto, @Headers('if-match') ifMatch?: string) {
    const version = ifMatch ? Number(ifMatch.replaceAll('"', '')) : undefined;
    return this.profiles.upsert(user.id, dto, Number.isInteger(version) ? version : undefined);
  }
}
