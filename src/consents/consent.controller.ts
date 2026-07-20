import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  AuthenticatedRequest,
  AuthenticatedUser,
  CurrentUser,
} from "../common/request-context";
import { AuthGuard } from "../identity/auth.guard";
import { RecordConsentDto } from "./consent.dto";
import { ConsentService } from "./consent.service";

@ApiTags("consents")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("me/consents")
export class ConsentController {
  constructor(private readonly consents: ConsentService) {}

  @Get()
  @ApiOkResponse()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.consents.list(user.id);
  }

  @Post()
  @ApiHeader({ name: "Idempotency-Key", required: true })
  @ApiCreatedResponse()
  record(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: AuthenticatedRequest,
    @Headers("idempotency-key") key: string,
    @Body() dto: RecordConsentDto,
  ) {
    return this.consents.record(
      user.id,
      request.requestId,
      key,
      dto.definition_id,
      dto.granted,
    );
  }

  @Post(":recordId/withdrawal")
  @ApiHeader({ name: "Idempotency-Key", required: true })
  @ApiCreatedResponse()
  withdraw(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: AuthenticatedRequest,
    @Headers("idempotency-key") key: string,
    @Param("recordId", ParseUUIDPipe) recordId: string,
  ) {
    return this.consents.withdraw(user.id, request.requestId, key, recordId);
  }
}
