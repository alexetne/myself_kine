import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  CurrentUser,
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../common/request-context";
import { AuthGuard } from "../identity/auth.guard";
import { Roles } from "../identity/roles.guard";
import {
  ChangeContentStatusDto,
  CreateExerciseDto,
  PublishExerciseVersionDto,
} from "./admin-content.dto";
import { AdminContentService } from "./admin-content.service";

@ApiTags("administration")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("admin/exercises")
export class AdminContentController {
  constructor(private readonly content: AdminContentService) {}
  @Post() @Roles("admin") create(
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.content.createExercise(actor.id, request.requestId, dto);
  }
  @Post(":id/publication") @Roles("content_reviewer", "admin") publish(
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PublishExerciseVersionDto,
  ) {
    return this.content.publish(actor.id, request.requestId, id, dto);
  }
  @Patch(":id/status") @Roles("admin") status(
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: AuthenticatedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ChangeContentStatusDto,
  ) {
    return this.content.changeStatus(actor.id, request.requestId, id, dto);
  }
}
