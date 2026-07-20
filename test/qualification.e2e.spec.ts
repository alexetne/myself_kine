import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  Injectable,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { Pool } from "pg";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { ApiExceptionFilter } from "../src/common/api-exception.filter";
import type { AuthenticatedRequest } from "../src/common/request-context";
import { AuthGuard } from "../src/identity/auth.guard";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://myself_kine:local-only-password@localhost:5433/myself_kine";

@Injectable()
class SyntheticAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const incoming = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const id = incoming.header("x-synthetic-user-id");
    if (!id) return false;
    incoming.user = { id, subject: `synthetic-${id}`, roles: ["user"] };
    return true;
  }
}

describe("qualification vertical journey (PostgreSQL + HTTP)", () => {
  let app: INestApplication;
  let httpServer: Server;
  let pool: Pool;
  let firstUserId: string;
  let secondUserId: string;
  let requiredConsentId: string;
  let questionnaireVersionId: string;
  let ruleSetVersionId: string;
  let firstConsentRecordId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.DATABASE_URL = databaseUrl;
    process.env.OIDC_ISSUER = "https://identity.invalid.example/";
    process.env.OIDC_AUDIENCE = "myself-kine-api";
    process.env.OIDC_JWKS_URI =
      "https://identity.invalid.example/.well-known/jwks.json";
    pool = new Pool({ connectionString: databaseUrl });
    await pool.query(
      `TRUNCATE audit_event, idempotency_record, safety_decision,
       questionnaire_submission, questionnaire_version, rule_set_version, rule_set,
       consent_withdrawal, consent_record, consent_definition,
       external_identity, app_user RESTART IDENTITY CASCADE`,
    );
    const users = await pool.query<{ id: string }>(
      "INSERT INTO app_user DEFAULT VALUES RETURNING id",
    );
    firstUserId = users.rows[0].id;
    const secondUser = await pool.query<{ id: string }>(
      "INSERT INTO app_user DEFAULT VALUES RETURNING id",
    );
    secondUserId = secondUser.rows[0].id;
    const consent = await pool.query<{ id: string }>(
      `INSERT INTO consent_definition(code, version, title, purpose, required, locale, content_hash, published_at)
       VALUES ('synthetic_required',1,'Consentement synthétique','Test synthétique',true,'fr-FR',$1,now()) RETURNING id`,
      ["a".repeat(64)],
    );
    requiredConsentId = consent.rows[0].id;
    const questionnaire = await pool.query<{ id: string }>(
      `INSERT INTO questionnaire_version(
         code, version, title, schema, status, content_hash,
         validated_by, validated_at, published_at
       ) VALUES ('synthetic-qualification',1,'Qualification synthétique',$1,'published',$2,
         'synthetic-reviewer',now(),now()) RETURNING id`,
      [
        {
          data_classification: "synthetic",
          questions: [
            {
              id: "synthetic_orientation",
              type: "single_choice",
              required: true,
              options: [
                "synthetic_clear",
                "synthetic_caution",
                "synthetic_professional_review",
                "synthetic_urgent",
              ],
            },
          ],
        },
        "b".repeat(64),
      ],
    );
    questionnaireVersionId = questionnaire.rows[0].id;
    const ruleSet = await pool.query<{ id: string }>(
      "INSERT INTO rule_set(code, kind) VALUES ('synthetic-qualification','safety') RETURNING id",
    );
    const ruleVersion = await pool.query<{ id: string }>(
      `INSERT INTO rule_set_version(
         rule_set_id, version, status, input_schema_version, rules, content_hash,
         validated_by, validated_at, published_at
       ) VALUES ($1,1,'published','synthetic-v1',$2,$3,'synthetic-reviewer',now(),now()) RETURNING id`,
      [
        ruleSet.rows[0].id,
        JSON.stringify([
          syntheticRule("urgent", 10),
          syntheticRule("professional_review", 20),
          syntheticRule("caution", 30),
          syntheticRule("clear", 40),
        ]),
        "c".repeat(64),
      ],
    );
    ruleSetVersionId = ruleVersion.rows[0].id;

    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(AuthGuard)
      .useClass(SyntheticAuthGuard)
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix("api/v1", {
      exclude: ["health/live", "health/ready"],
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    if (app) await app.close();
    if (pool) await pool.end();
  });

  it("refuses qualification while mandatory consent is absent", async () => {
    const response = await submit(firstUserId, "missing-consent", "clear");
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("REQUIRED_CONSENT_MISSING");
  });

  it("records consent append-only, idempotently and with an audit event", async () => {
    const payload = { definition_id: requiredConsentId, granted: true };
    const first = await request(httpServer)
      .post("/api/v1/me/consents")
      .set("x-synthetic-user-id", firstUserId)
      .set("Idempotency-Key", "consent-grant-001")
      .send(payload);
    const replay = await request(httpServer)
      .post("/api/v1/me/consents")
      .set("x-synthetic-user-id", firstUserId)
      .set("Idempotency-Key", "consent-grant-001")
      .send(payload);
    expect(first.status).toBe(201);
    expect(replay.status).toBe(201);
    expect(replay.body.id).toBe(first.body.id);
    firstConsentRecordId = first.body.id;
    const counts = await pool.query<{ records: string; audits: string }>(
      `SELECT
        (SELECT count(*) FROM consent_record WHERE user_id=$1)::text records,
        (SELECT count(*) FROM audit_event WHERE actor_user_id=$1 AND action='consent.recorded')::text audits`,
      [firstUserId],
    );
    expect(counts.rows[0]).toEqual({ records: "1", audits: "1" });
  });

  it("returns only a precise published questionnaire version", async () => {
    const list = await request(httpServer)
      .get("/api/v1/questionnaires")
      .set("x-synthetic-user-id", firstUserId);
    const exact = await request(httpServer)
      .get(`/api/v1/questionnaires/${questionnaireVersionId}`)
      .set("x-synthetic-user-id", firstUserId);
    const wrong = await submit(
      firstUserId,
      "wrong-version-001",
      "clear",
      randomUUID(),
    );
    expect(list.status).toBe(200);
    expect(list.body.items).toHaveLength(1);
    expect(exact.status).toBe(200);
    expect(exact.body.id).toBe(questionnaireVersionId);
    expect(wrong.status).toBe(409);
    expect(wrong.body.error.code).toBe("QUESTIONNAIRE_VERSION_INVALID");
  });

  it.each(["clear", "caution", "professional_review", "urgent"] as const)(
    "persists the deterministic synthetic %s level",
    async (level) => {
      const response = await submit(
        firstUserId,
        `orientation-${level}-001`,
        level,
      );
      if (response.status !== 201)
        throw new Error(
          `Unexpected ${response.status}: ${JSON.stringify(response.body)}`,
        );
      expect(response.body.safety).toMatchObject({
        level,
        rule_set_version_id: ruleSetVersionId,
        matched_rule_code: `synthetic-${level}`,
      });
      expect(response.body.safety).not.toHaveProperty("diagnosis");
      const persisted = await pool.query<{
        level: string;
        rule_set_version_id: string;
        matched_rule_code: string;
        reason_code: string;
        explanation: string;
        inputs: { questionnaire_submission_id: string };
      }>(
        `SELECT level, rule_set_version_id, matched_rule_code, reason_code, explanation, inputs
         FROM safety_decision WHERE id=$1`,
        [response.body.safety.decision_id],
      );
      expect(persisted.rows[0]).toMatchObject({
        level,
        rule_set_version_id: ruleSetVersionId,
        matched_rule_code: `synthetic-${level}`,
        reason_code: `SYNTHETIC_${level.toUpperCase()}`,
        inputs: { questionnaire_submission_id: response.body.id },
      });
    },
  );

  it("replays a double submission without duplicating facts or decisions", async () => {
    const first = await submit(firstUserId, "double-submit-001", "clear");
    const replay = await submit(firstUserId, "double-submit-001", "clear");
    expect(replay.status).toBe(201);
    expect(replay.body.id).toBe(first.body.id);
    const count = await pool.query<{ count: string }>(
      "SELECT count(*)::text count FROM questionnaire_submission WHERE id=$1",
      [first.body.id],
    );
    expect(count.rows[0].count).toBe("1");
  });

  it("refuses evaluation when the rule set is not published", async () => {
    await pool.query(
      "UPDATE rule_set_version SET status='disabled', disabled_at=now() WHERE id=$1",
      [ruleSetVersionId],
    );
    const response = await submit(firstUserId, "unpublished-rule-001", "clear");
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("SAFETY_REFERENCE_NOT_PUBLISHED");
    await pool.query(
      "UPDATE rule_set_version SET status='published', disabled_at=NULL WHERE id=$1",
      [ruleSetVersionId],
    );
  });

  it("does not expose or withdraw another user's consent", async () => {
    const response = await request(httpServer)
      .post(`/api/v1/me/consents/${firstConsentRecordId}/withdrawal`)
      .set("x-synthetic-user-id", secondUserId)
      .set("Idempotency-Key", "foreign-withdraw-001")
      .send();
    expect(response.status).toBe(404);
    const withdrawal = await pool.query(
      "SELECT 1 FROM consent_withdrawal WHERE consent_record_id=$1",
      [firstConsentRecordId],
    );
    expect(withdrawal.rowCount).toBe(0);
  });

  it("withdraws the owner's consent append-only and blocks later qualification", async () => {
    const response = await request(httpServer)
      .post(`/api/v1/me/consents/${firstConsentRecordId}/withdrawal`)
      .set("x-synthetic-user-id", firstUserId)
      .set("Idempotency-Key", "owner-withdraw-001")
      .send();
    expect(response.status).toBe(201);
    const preserved = await pool.query<{ records: string; audits: string }>(
      `SELECT
        (SELECT count(*) FROM consent_record WHERE id=$1)::text records,
        (SELECT count(*) FROM audit_event WHERE resource_id=$1 AND action='consent.withdrawn')::text audits`,
      [firstConsentRecordId],
    );
    expect(preserved.rows[0]).toEqual({ records: "1", audits: "1" });
    const blocked = await submit(firstUserId, "after-withdraw-001", "clear");
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.code).toBe("REQUIRED_CONSENT_MISSING");
  });

  function submit(
    userId: string,
    key: string,
    level: "clear" | "caution" | "professional_review" | "urgent",
    versionId = questionnaireVersionId,
  ) {
    return request(httpServer)
      .post(`/api/v1/questionnaires/${versionId}/submissions`)
      .set("x-synthetic-user-id", userId)
      .set("Idempotency-Key", key)
      .send({
        answers: [
          {
            question_id: "synthetic_orientation",
            value: `synthetic_${level}`,
          },
        ],
      });
  }
});

function syntheticRule(level: string, priority: number) {
  return {
    code: `synthetic-${level}`,
    priority,
    when: {
      fact: "synthetic_orientation",
      operator: "eq",
      value: `synthetic_${level}`,
    },
    level,
    reason_code: `SYNTHETIC_${level.toUpperCase()}`,
    explanation: `Orientation synthétique ${level}, sans diagnostic.`,
  };
}
