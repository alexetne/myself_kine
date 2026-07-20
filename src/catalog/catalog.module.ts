import { Module } from "@nestjs/common";
import { AuthGuard } from "../identity/auth.guard";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, AuthGuard],
})
export class CatalogModule {}
