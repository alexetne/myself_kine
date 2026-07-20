import { Module } from "@nestjs/common";
import { AuthGuard } from "../identity/auth.guard";
import { SafetyModule } from "../safety/safety.module";
import { QuestionnaireController } from "./questionnaire.controller";
import { QuestionnaireService } from "./questionnaire.service";

@Module({
  imports: [SafetyModule],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, AuthGuard],
})
export class QuestionnaireModule {}
