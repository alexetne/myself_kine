import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { DatabaseService } from "../infrastructure/database/database.service";
import { SafetyService } from "../safety/safety.service";
import { QuestionnaireAnswerDto } from "./questionnaire.dto";

export interface QuestionnaireRow {
  id: string;
  code: string;
  version: number;
  title: string;
  schema: { questions?: unknown };
  content_hash: string;
  locale: string;
  published_at: string;
}

interface StoredIdempotency {
  request_hash: string;
  response_body: Record<string, unknown>;
}

@Injectable()
export class QuestionnaireService {
  constructor(
    private readonly database: DatabaseService,
    private readonly safety: SafetyService,
  ) {}

  async list(): Promise<{ items: QuestionnaireRow[] }> {
    const result = await this.database.query<QuestionnaireRow>(
      `SELECT id, code, version, title, schema, content_hash, locale, published_at
       FROM questionnaire_version
       WHERE status='published' AND published_at <= now() AND retired_at IS NULL
       ORDER BY code, version DESC`,
    );
    return { items: result.rows };
  }

  async get(versionId: string): Promise<QuestionnaireRow> {
    const result = await this.database.query<QuestionnaireRow>(
      `SELECT id, code, version, title, schema, content_hash, locale, published_at
       FROM questionnaire_version
       WHERE id=$1 AND status='published' AND published_at <= now() AND retired_at IS NULL`,
      [versionId],
    );
    if (!result.rows[0])
      throw new NotFoundException({ code: "QUESTIONNAIRE_VERSION_NOT_FOUND" });
    return result.rows[0];
  }

  async submit(
    userId: string,
    requestId: string,
    key: string,
    versionId: string,
    answers: QuestionnaireAnswerDto[],
  ): Promise<Record<string, unknown>> {
    if (!key || key.length < 8 || key.length > 128)
      throw new BadRequestException({ code: "IDEMPOTENCY_KEY_REQUIRED" });
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ versionId, answers }))
      .digest("hex");

    return this.database.transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        `${userId}:questionnaire.submit:${key}`,
      ]);
      const known = await client.query<StoredIdempotency>(
        `SELECT request_hash, response_body FROM idempotency_record
         WHERE user_id=$1 AND operation='questionnaire.submit' AND key=$2 FOR UPDATE`,
        [userId, key],
      );
      if (known.rows[0]) {
        if (known.rows[0].request_hash !== requestHash)
          throw new ConflictException({ code: "IDEMPOTENCY_CONFLICT" });
        return known.rows[0].response_body;
      }

      const missingConsent = await client.query<{ code: string }>(
        `SELECT d.code FROM consent_definition d
         WHERE d.required=true AND d.published_at <= now() AND d.retired_at IS NULL
           AND NOT EXISTS (
             SELECT 1 FROM consent_record r
             LEFT JOIN consent_withdrawal w ON w.consent_record_id=r.id
             WHERE r.user_id=$1 AND r.definition_id=d.id AND r.granted=true AND w.id IS NULL
               AND NOT EXISTS (
                 SELECT 1 FROM consent_record newer
                 WHERE newer.user_id=r.user_id AND newer.definition_id=r.definition_id
                   AND (newer.recorded_at, newer.id) > (r.recorded_at, r.id)
               )
           ) LIMIT 1`,
        [userId],
      );
      if (missingConsent.rows[0])
        throw new ForbiddenException({
          code: "REQUIRED_CONSENT_MISSING",
          user_message:
            "Un consentement obligatoire doit être renseigné avant de continuer.",
        });

      const questionnaire = await client.query<QuestionnaireRow>(
        `SELECT id, code, version, title, schema, content_hash, locale, published_at
         FROM questionnaire_version
         WHERE id=$1 AND status='published' AND published_at <= now() AND retired_at IS NULL`,
        [versionId],
      );
      if (!questionnaire.rows[0])
        throw new ConflictException({
          code: "QUESTIONNAIRE_VERSION_INVALID",
          user_message: "Cette version du questionnaire n’est plus disponible.",
        });

      const facts = this.validateAnswers(questionnaire.rows[0].schema, answers);
      const submission = await client.query<{
        id: string;
        submitted_at: string;
      }>(
        `INSERT INTO questionnaire_submission(user_id, questionnaire_version_id, answers)
         VALUES ($1,$2,$3) RETURNING id, submitted_at`,
        [userId, versionId, JSON.stringify(answers)],
      );
      const safety = await this.safety.evaluate(
        client,
        userId,
        submission.rows[0].id,
        facts,
      );
      const response = {
        id: submission.rows[0].id,
        questionnaire_version_id: versionId,
        submitted_at: submission.rows[0].submitted_at,
        safety,
      };
      await client.query(
        `INSERT INTO audit_event(actor_user_id, actor_type, action, resource_type, resource_id, outcome, request_id, context)
         VALUES ($1,'user','questionnaire.submitted','questionnaire_submission',$2,'success',$3,$4)`,
        [
          userId,
          submission.rows[0].id,
          requestId,
          { questionnaire_version_id: versionId, safety_level: safety.level },
        ],
      );
      await client.query(
        `INSERT INTO idempotency_record(user_id, operation, key, request_hash, response_status, response_body, expires_at)
         VALUES ($1,'questionnaire.submit',$2,$3,201,$4,now()+interval '24 hours')`,
        [userId, key, requestHash, response],
      );
      return response;
    });
  }

  private validateAnswers(
    schema: QuestionnaireRow["schema"],
    answers: QuestionnaireAnswerDto[],
  ): Record<string, unknown> {
    if (!Array.isArray(schema.questions))
      throw new ConflictException({ code: "QUESTIONNAIRE_SCHEMA_INVALID" });
    const questions = schema.questions as Array<{
      id?: unknown;
      required?: unknown;
      options?: unknown;
    }>;
    const definitions = new Map(
      questions
        .filter((question) => typeof question.id === "string")
        .map((question) => [question.id as string, question]),
    );
    if (definitions.size !== questions.length)
      throw new ConflictException({ code: "QUESTIONNAIRE_SCHEMA_INVALID" });
    const facts: Record<string, unknown> = {};
    for (const answer of answers) {
      const definition = definitions.get(answer.question_id);
      if (!definition || Object.hasOwn(facts, answer.question_id))
        throw new BadRequestException({
          code: "QUESTIONNAIRE_ANSWERS_INVALID",
        });
      if (
        Array.isArray(definition.options) &&
        !definition.options.includes(answer.value)
      )
        throw new BadRequestException({
          code: "QUESTIONNAIRE_ANSWERS_INVALID",
        });
      facts[answer.question_id] = answer.value;
    }
    for (const [id, definition] of definitions) {
      if (definition.required === true && !Object.hasOwn(facts, id))
        throw new BadRequestException({
          code: "QUESTIONNAIRE_ANSWERS_INVALID",
        });
    }
    return facts;
  }
}
