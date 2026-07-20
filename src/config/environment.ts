import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, validateSync } from 'class-validator';

class Environment {
  @IsIn(['development', 'test', 'production']) NODE_ENV = 'development';
  @IsString() @IsNotEmpty() DATABASE_URL!: string;
  @IsUrl({ require_tld: false }) OIDC_ISSUER!: string;
  @IsString() @IsNotEmpty() OIDC_AUDIENCE!: string;
  @IsUrl({ require_tld: false }) OIDC_JWKS_URI!: string;
  @IsOptional() @IsString() CORS_ORIGINS = '';
  @IsOptional() @IsBooleanString() TRUST_PROXY = 'false';
}

export function validateEnvironment(config: Record<string, unknown>): Environment {
  const value = plainToInstance(Environment, config, { enableImplicitConversion: false });
  const errors = validateSync(value, { skipMissingProperties: false });
  if (errors.length) throw new Error(`Invalid environment configuration: ${errors.map((e) => e.property).join(', ')}`);
  return value;
}
