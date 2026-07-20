import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../infrastructure/database/database.service";
import {
  ChangeContentStatusDto,
  CreateExerciseDto,
  PublishExerciseVersionDto,
} from "./admin-content.dto";

@Injectable()
export class AdminContentService {
  constructor(private readonly database: DatabaseService) {}

  createExercise(actorId: string, requestId: string, dto: CreateExerciseDto) {
    return this.database.transaction(async (client) => {
      const exercise = await client.query<{ id: string }>(
        "INSERT INTO exercise(slug) VALUES ($1) RETURNING id",
        [dto.slug],
      );
      const version = await client.query(
        "INSERT INTO exercise_version(exercise_id, version, title, body) VALUES ($1,1,$2,$3) RETURNING id, version, status",
        [exercise.rows[0].id, dto.title, dto.body],
      );
      await client.query(
        `INSERT INTO audit_event(actor_user_id, actor_type, action, resource_type, resource_id, outcome, request_id) VALUES ($1,'administrator','exercise.created','exercise',$2,'success',$3)`,
        [actorId, exercise.rows[0].id, requestId],
      );
      return {
        id: exercise.rows[0].id,
        slug: dto.slug,
        current_version: version.rows[0],
      };
    });
  }

  publish(
    actorId: string,
    requestId: string,
    exerciseId: string,
    dto: PublishExerciseVersionDto,
  ) {
    return this.database.transaction(async (client) => {
      const result = await client.query(
        `UPDATE exercise_version SET status='published', validated_by=$1, validated_at=now(), published_at=now()
         WHERE id=$2 AND exercise_id=$3 AND status IN ('draft','in_review') RETURNING id, version, status, published_at`,
        [dto.validator_reference, dto.version_id, exerciseId],
      );
      if (!result.rows[0])
        throw new ConflictException({
          code: "INVALID_STATE_TRANSITION",
          user_message: "Cette version ne peut pas être publiée.",
        });
      await client.query(
        `INSERT INTO audit_event(actor_user_id, actor_type, action, resource_type, resource_id, outcome, request_id, context) VALUES ($1,'content_reviewer','exercise.published','exercise_version',$2,'success',$3,$4)`,
        [
          actorId,
          dto.version_id,
          requestId,
          { validator_reference: dto.validator_reference },
        ],
      );
      return result.rows[0];
    });
  }

  changeStatus(
    actorId: string,
    requestId: string,
    exerciseId: string,
    dto: ChangeContentStatusDto,
  ) {
    return this.database.transaction(async (client) => {
      const found = await client.query<{ id: string }>(
        "SELECT id FROM exercise WHERE id=$1",
        [exerciseId],
      );
      if (!found.rows[0]) throw new NotFoundException();
      const result = await client.query(
        `UPDATE exercise_version SET status=$1, archived_at=CASE WHEN $1='archived' THEN now() ELSE archived_at END WHERE exercise_id=$2 AND status='published' RETURNING id, status`,
        [dto.status, exerciseId],
      );
      await client.query(
        `INSERT INTO audit_event(actor_user_id, actor_type, action, resource_type, resource_id, outcome, reason_code, request_id) VALUES ($1,'administrator','exercise.status_changed','exercise',$2,'success',$3,$4)`,
        [actorId, exerciseId, dto.reason, requestId],
      );
      return { exercise_id: exerciseId, affected_versions: result.rows };
    });
  }
}
