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
import { SubmitQuestionnaireDto } from "./questionnaire.dto";
import { QuestionnaireService } from "./questionnaire.service";

@ApiTags("questionnaires")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("questionnaires")
export class QuestionnaireController {
  constructor(private readonly questionnaires: QuestionnaireService) {}

  @Get()
  @ApiOkResponse()
  list() {
    return this.questionnaires.list();
  }

  @Get(":versionId")
  @ApiOkResponse()
  get(@Param("versionId", ParseUUIDPipe) versionId: string) {
    return this.questionnaires.get(versionId);
  }

  @Post(":versionId/submissions")
  @ApiHeader({ name: "Idempotency-Key", required: true })
  @ApiCreatedResponse()
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: AuthenticatedRequest,
    @Headers("idempotency-key") key: string,
    @Param("versionId", ParseUUIDPipe) versionId: string,
    @Body() dto: SubmitQuestionnaireDto,
  ) {
    return this.questionnaires.submit(
      user.id,
      request.requestId,
      key,
      versionId,
      dto.answers,
    );
  }
}
