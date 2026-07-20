import { Module } from "@nestjs/common";
import { AuthGuard } from "../identity/auth.guard";
import { AdminContentController } from "./admin-content.controller";
import { AdminContentService } from "./admin-content.service";

@Module({
  controllers: [AdminContentController],
  providers: [AdminContentService, AuthGuard],
})
export class AdminModule {}
