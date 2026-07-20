import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { CatalogModule } from "./catalog/catalog.module";
import { RequestIdMiddleware } from "./common/request-id.middleware";
import { validateEnvironment } from "./config/environment";
import { HealthController } from "./health.controller";
import { IdentityModule } from "./identity/identity.module";
import { RolesGuard } from "./identity/roles.guard";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { ProfileModule } from "./profile/profile.module";
import { TrackingModule } from "./tracking/tracking.module";
import { AdminModule } from "./admin/admin.module";
import { ConsentModule } from "./consents/consent.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    DatabaseModule,
    IdentityModule,
    ProfileModule,
    CatalogModule,
    TrackingModule,
    AdminModule,
    ConsentModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
