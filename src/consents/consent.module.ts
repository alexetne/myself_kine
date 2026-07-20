import { Module } from "@nestjs/common";
import { AuthGuard } from "../identity/auth.guard";
import { ConsentController } from "./consent.controller";
import { ConsentService } from "./consent.service";

@Module({
  controllers: [ConsentController],
  providers: [ConsentService, AuthGuard],
  exports: [ConsentService],
})
export class ConsentModule {}
