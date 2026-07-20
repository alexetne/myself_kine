import { plainToInstance } from "class-transformer";
import {
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from "class-validator";

class Environment {
  @IsIn(["development", "test", "production"]) NODE_ENV = "development";
  @IsString() @IsNotEmpty() DATABASE_URL!: string;
  @IsUrl({ require_tld: false }) OIDC_ISSUER!: string;
  @IsString() @IsNotEmpty() OIDC_AUDIENCE!: string;
  @IsUrl({ require_tld: false }) OIDC_JWKS_URI!: string;
  @IsOptional() @IsString() CORS_ORIGINS = "";
  @IsOptional() @IsBooleanString() TRUST_PROXY = "false";
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment {
  if (config.OPENAPI_GENERATION === "true") {
    if (!config.DATABASE_URL)
      config.DATABASE_URL = "postgresql://documentation.invalid/documentation";
    if (!config.OIDC_ISSUER)
      config.OIDC_ISSUER = "https://identity.invalid.example/";
    if (!config.OIDC_AUDIENCE) config.OIDC_AUDIENCE = "myself-kine-api";
    if (!config.OIDC_JWKS_URI)
      config.OIDC_JWKS_URI =
        "https://identity.invalid.example/.well-known/jwks.json";
  }
  const value = plainToInstance(Environment, config, {
    enableImplicitConversion: false,
  });
  const errors = validateSync(value, { skipMissingProperties: false });
  if (errors.length)
    throw new Error(
      `Invalid environment configuration: ${errors.map((e) => e.property).join(", ")}`,
    );
  return value;
}
