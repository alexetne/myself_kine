process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??=
  "postgresql://myself_kine:local-only-password@localhost:5433/myself_kine";
process.env.OIDC_ISSUER ??= "https://identity.invalid.example/";
process.env.OIDC_AUDIENCE ??= "myself-kine-api";
process.env.OIDC_JWKS_URI ??=
  "https://identity.invalid.example/.well-known/jwks.json";
