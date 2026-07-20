import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../infrastructure/database/database.service';
import { UpsertProfileDto } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly database: DatabaseService) {}

  async get(userId: string): Promise<Record<string, unknown>> {
    const result = await this.database.query('SELECT birth_year, practices, level, goal, weekly_availability, equipment, version, updated_at FROM sport_profile WHERE user_id = $1', [userId]);
    if (!result.rows[0]) throw new NotFoundException({ code: 'PROFILE_NOT_FOUND', user_message: 'Le profil sportif doit être complété.' });
    return result.rows[0];
  }

  async upsert(userId: string, dto: UpsertProfileDto, expectedVersion?: number): Promise<Record<string, unknown>> {
    const result = await this.database.query(
      `INSERT INTO sport_profile(user_id, birth_year, practices, level, goal, weekly_availability, equipment)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id) DO UPDATE SET birth_year=EXCLUDED.birth_year, practices=EXCLUDED.practices,
       level=EXCLUDED.level, goal=EXCLUDED.goal, weekly_availability=EXCLUDED.weekly_availability,
       equipment=EXCLUDED.equipment, version=sport_profile.version+1, updated_at=now()
       WHERE $8::integer IS NULL OR sport_profile.version=$8
       RETURNING birth_year, practices, level, goal, weekly_availability, equipment, version, updated_at`,
      [userId, dto.birth_year, dto.practices, dto.level, dto.goal, dto.weekly_availability, dto.equipment, expectedVersion ?? null]
    );
    if (!result.rows[0]) throw new NotFoundException({ code: 'VERSION_CONFLICT', user_message: 'Le profil a été modifié sur un autre appareil.' });
    return result.rows[0];
  }
}
