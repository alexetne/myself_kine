import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { DatabaseService } from "../infrastructure/database/database.service";

interface StoredIdempotency {
  request_hash: string;
  response_body: Record<string, unknown>;
}

@Injectable()
export class ConsentService {
  constructor(private readonly database: DatabaseService) {}

  async list(userId: string): Promise<{ items: unknown[] }> {
    const result = await this.database.query(
      `SELECT d.id AS definition_id, d.code, d.version, d.title, d.purpose, d.required,
              d.content_hash, d.locale,
              CASE
                WHEN latest.id IS NULL THEN 'not_recorded'
                WHEN withdrawal.id IS NOT NULL THEN 'withdrawn'
                WHEN latest.granted THEN 'granted'
                ELSE 'refused'
              END AS state,
              latest.id AS record_id, latest.recorded_at
       FROM consent_definition d
       LEFT JOIN LATERAL (
         SELECT r.id, r.granted, r.recorded_at
         FROM consent_record r
         WHERE r.user_id=$1 AND r.definition_id=d.id
         ORDER BY r.recorded_at DESC, r.id DESC LIMIT 1
       ) latest ON true
       LEFT JOIN consent_withdrawal withdrawal ON withdrawal.consent_record_id=latest.id
       WHERE d.published_at <= now() AND d.retired_at IS NULL
       ORDER BY d.required DESC, d.code, d.version DESC`,
      [userId],
    );
    return { items: result.rows };
  }

  async record(
    userId: string,
    requestId: string,
    key: string,
    definitionId: string,
    granted: boolean,
  ): Promise<Record<string, unknown>> {
    this.requireKey(key);
    const body = { definition_id: definitionId, granted };
    const hash = this.hash(body);
    return this.database.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        `${userId}:consent.record:${key}`,
      ]);
      const known = await client.query<StoredIdempotency>(
        `SELECT request_hash, response_body FROM idempotency_record
         WHERE user_id=$1 AND operation='consent.record' AND key=$2 FOR UPDATE`,
        [userId, key],
      );
      if (known.rows[0]) return this.replay(known.rows[0], hash);

      const definition = await client.query(
        `SELECT id FROM consent_definition
         WHERE id=$1 AND published_at <= now() AND retired_at IS NULL`,
        [definitionId],
      );
      if (!definition.rows[0])
        throw new NotFoundException({ code: "CONSENT_DEFINITION_NOT_FOUND" });

      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO consent_record(user_id, definition_id, granted)
         VALUES ($1,$2,$3) RETURNING id, definition_id, granted, recorded_at`,
        [userId, definitionId, granted],
      );
      const response = inserted.rows[0];
      await client.query(
        `INSERT INTO audit_event(actor_user_id, actor_type, action, resource_type, resource_id, outcome, request_id, context)
         VALUES ($1,'user','consent.recorded','consent_record',$2,'success',$3,$4)`,
        [
          userId,
          response.id,
          requestId,
          { definition_id: definitionId, granted },
        ],
      );
      await client.query(
        `INSERT INTO idempotency_record(user_id, operation, key, request_hash, response_status, response_body, expires_at)
         VALUES ($1,'consent.record',$2,$3,201,$4,now()+interval '24 hours')`,
        [userId, key, hash, response],
      );
      return response;
    });
  }

  async withdraw(
    userId: string,
    requestId: string,
    key: string,
    recordId: string,
  ): Promise<Record<string, unknown>> {
    this.requireKey(key);
    const hash = this.hash({ record_id: recordId });
    return this.database.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        `${userId}:consent.withdraw:${key}`,
      ]);
      const known = await client.query<StoredIdempotency>(
        `SELECT request_hash, response_body FROM idempotency_record
         WHERE user_id=$1 AND operation='consent.withdraw' AND key=$2 FOR UPDATE`,
        [userId, key],
      );
      if (known.rows[0]) return this.replay(known.rows[0], hash);

      const owned = await client.query(
        `SELECT r.id FROM consent_record r WHERE r.id=$1 AND r.user_id=$2 AND r.granted=true`,
        [recordId, userId],
      );
      if (!owned.rows[0]) throw new NotFoundException();
      const inserted = await client.query<Record<string, unknown>>(
        `INSERT INTO consent_withdrawal(user_id, consent_record_id)
         VALUES ($1,$2) ON CONFLICT (consent_record_id) DO UPDATE SET consent_record_id=EXCLUDED.consent_record_id
         RETURNING id, consent_record_id AS record_id, withdrawn_at`,
        [userId, recordId],
      );
      const response = inserted.rows[0];
      await client.query(
        `INSERT INTO audit_event(actor_user_id, actor_type, action, resource_type, resource_id, outcome, request_id)
         VALUES ($1,'user','consent.withdrawn','consent_record',$2,'success',$3)`,
        [userId, recordId, requestId],
      );
      await client.query(
        `INSERT INTO idempotency_record(user_id, operation, key, request_hash, response_status, response_body, expires_at)
         VALUES ($1,'consent.withdraw',$2,$3,201,$4,now()+interval '24 hours')`,
        [userId, key, hash, response],
      );
      return response;
    });
  }

  private requireKey(key: string): void {
    if (!key || key.length < 8 || key.length > 128)
      throw new BadRequestException({ code: "IDEMPOTENCY_KEY_REQUIRED" });
  }
  private hash(value: unknown): string {
    return createHash("sha256").update(JSON.stringify(value)).digest("hex");
  }
  private replay(
    stored: StoredIdempotency,
    expectedHash: string,
  ): Record<string, unknown> {
    if (stored.request_hash !== expectedHash)
      throw new ConflictException({ code: "IDEMPOTENCY_CONFLICT" });
    return stored.response_body;
  }
}
