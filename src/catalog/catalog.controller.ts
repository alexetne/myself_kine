import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../identity/auth.guard";
import { CatalogService } from "./catalog.service";

@ApiTags("catalog")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("exercises")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get() list(
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("cursor") cursor?: string,
  ) {
    return this.catalog.list(Math.min(Math.max(limit, 1), 100), cursor);
  }
  @Get(":id") get(@Param("id", ParseUUIDPipe) id: string) {
    return this.catalog.get(id);
  }
}
