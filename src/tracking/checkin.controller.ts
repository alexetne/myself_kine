import { Body, Controller, Headers, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUser, AuthenticatedUser } from "../common/request-context";
import { AuthGuard } from "../identity/auth.guard";
import { CreateCheckinDto } from "./checkin.dto";
import { CheckinService } from "./checkin.service";

@ApiTags("tracking")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("daily-checkins")
export class CheckinController {
  constructor(private readonly checkins: CheckinService) {}
  @Post()
  @ApiHeader({ name: "Idempotency-Key", required: true })
  @ApiCreatedResponse()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Headers("idempotency-key") key: string,
    @Body() dto: CreateCheckinDto,
  ) {
    return this.checkins.create(user.id, key, dto);
  }
}
