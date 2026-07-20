import { ConflictException, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { DatabaseService } from "../infrastructure/database/database.service";
import { AdaptationEngine } from "../adaptation/adaptation.engine";
import { CreateCheckinDto } from "./checkin.dto";

@Injectable()
export class CheckinService {
  constructor(
    private readonly database: DatabaseService,
    private readonly engine: AdaptationEngine,
  ) {}
  async create(
    userId: string,
    key: string,
    dto: CreateCheckinDto,
  ): Promise<Record<string, unknown>> {
    if (!key || key.length < 8)
      throw new ConflictException({
        code: "IDEMPOTENCY_KEY_REQUIRED",
        user_message: "Une clé d’idempotence est requise.",
      });
    const hash = createHash("sha256").update(JSON.stringify(dto)).digest("hex");
    return this.database.transaction(async (client) => {
      const known = await client.query<{
        request_hash: string;
        response_body: Record<string, unknown>;
      }>(
        "SELECT request_hash, response_body FROM idempotency_record WHERE user_id=$1 AND operation=$2 AND key=$3 FOR UPDATE",
        [userId, "daily-checkin.create", key],
      );
      if (known.rows[0]) {
        if (known.rows[0].request_hash !== hash)
          throw new ConflictException({
            code: "IDEMPOTENCY_CONFLICT",
            user_message:
              "Cette clé a déjà été utilisée avec des données différentes.",
          });
        return known.rows[0].response_body;
      }
      const inserted = await client.query<{ id: string; created_at: string }>(
        `INSERT INTO daily_checkin(user_id, local_date, timezone, fatigue, sleep_quality, stress, motivation, discomfort, comment)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, created_at`,
        [
          userId,
          dto.local_date,
          dto.timezone,
          dto.fatigue,
          dto.sleep_quality,
          dto.stress,
          dto.motivation,
          dto.discomfort ?? null,
          dto.comment ?? null,
        ],
      );
      const adaptation = this.engine.evaluate({
        fatigue: dto.fatigue,
        sleepQuality: dto.sleep_quality,
        discomfort: dto.discomfort,
      });
      const body = {
        ...inserted.rows[0],
        local_date: dto.local_date,
        adaptation,
      };
      await client.query(
        `INSERT INTO idempotency_record(user_id, operation, key, request_hash, response_status, response_body, expires_at) VALUES ($1,$2,$3,$4,201,$5,now()+interval '24 hours')`,
        [userId, "daily-checkin.create", key, hash, body],
      );
      return body;
    });
  }
}
