import { writeFile } from "node:fs/promises";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function main(): Promise<void> {
  process.env.OPENAPI_GENERATION = "true";
  const { createApplication } = await import("../src/bootstrap");
  const app = await createApplication();
  const config = new DocumentBuilder()
    .setTitle("Myself Kine API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  await writeFile(
    "openapi.generated.json",
    JSON.stringify(document, null, 2),
  );
  await app.close();
}

void main();
