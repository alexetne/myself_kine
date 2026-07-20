import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../infrastructure/database/database.service';

@Injectable()
export class CatalogService {
  constructor(private readonly database: DatabaseService) {}
  async list(limit: number, cursor?: string) {
    const result = await this.database.query(
      `SELECT e.id, e.slug, ev.id AS version_id, ev.version, ev.title, ev.body, ev.published_at
       FROM exercise e JOIN LATERAL (
         SELECT * FROM exercise_version WHERE exercise_id=e.id AND status='published' ORDER BY version DESC LIMIT 1
       ) ev ON true WHERE ($1::uuid IS NULL OR e.id > $1) ORDER BY e.id LIMIT $2`, [cursor ?? null, limit + 1]
    );
    const hasMore = result.rows.length > limit;
    const items = result.rows.slice(0, limit);
    return { items, next_cursor: hasMore ? items.at(-1)?.id : null };
  }
  async get(id: string) {
    const result = await this.database.query(
      `SELECT e.id, e.slug, ev.id AS version_id, ev.version, ev.title, ev.body, ev.published_at
       FROM exercise e JOIN LATERAL (SELECT * FROM exercise_version WHERE exercise_id=e.id AND status='published' ORDER BY version DESC LIMIT 1) ev ON true
       WHERE e.id=$1`, [id]
    );
    if (!result.rows[0]) throw new NotFoundException();
    return result.rows[0];
  }
}
