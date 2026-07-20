export function createRemoteJWKSet(): () => never {
  return () => {
    throw new Error("OIDC is not called by synthetic integration tests");
  };
}

export async function jwtVerify(): Promise<never> {
  throw new Error("OIDC is not called by synthetic integration tests");
}
