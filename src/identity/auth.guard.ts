import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { DatabaseService } from "../infrastructure/database/database.service";
import type { AuthenticatedRequest } from "../common/request-context";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly issuer: string;
  private readonly audience: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    @Inject(ConfigService) config: ConfigService,
    private readonly database: DatabaseService,
  ) {
    this.issuer = config.getOrThrow("OIDC_ISSUER");
    this.audience = config.getOrThrow("OIDC_AUDIENCE");
    this.jwks = createRemoteJWKSet(new URL(config.getOrThrow("OIDC_JWKS_URI")));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.header("authorization");
    if (!authorization?.startsWith("Bearer "))
      throw new UnauthorizedException();
    try {
      const { payload } = await jwtVerify(authorization.slice(7), this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
      });
      if (!payload.sub) throw new Error("Missing subject");
      const userId = await this.database.transaction(async (client) => {
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
          `${this.issuer}\u0000${payload.sub}`,
        ]);
        const existing = await client.query<{ user_id: string }>(
          "SELECT user_id FROM external_identity WHERE issuer=$1 AND subject=$2",
          [this.issuer, payload.sub],
        );
        if (existing.rows[0]) return existing.rows[0].user_id;
        const created = await client.query<{ id: string }>(
          "INSERT INTO app_user DEFAULT VALUES RETURNING id",
        );
        await client.query(
          "INSERT INTO external_identity(user_id, issuer, subject) VALUES ($1,$2,$3)",
          [created.rows[0].id, this.issuer, payload.sub],
        );
        return created.rows[0].id;
      });
      const roles = Array.isArray(payload.roles)
        ? payload.roles.filter(
            (role): role is string => typeof role === "string",
          )
        : ["user"];
      request.user = { id: userId, subject: payload.sub, roles };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
