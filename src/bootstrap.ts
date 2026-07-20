import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/api-exception.filter";

export async function createApplication() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix("api/v1", { exclude: ["health/live", "health/ready"] });
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
  const origins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });
  const config = new DocumentBuilder()
    .setTitle("Myself Kine API")
    .setDescription(
      "Accompagnement sportif uniquement — aucun diagnostic médical.",
    )
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
    .build();
  SwaggerModule.setup(
    "api/docs",
    app,
    SwaggerModule.createDocument(app, config),
    { jsonDocumentUrl: "api/openapi.json" },
  );
  return app;
}
