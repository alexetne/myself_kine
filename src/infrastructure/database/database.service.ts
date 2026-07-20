import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly pool: Pool;
  private readonly connectOnStartup: boolean;

  constructor(@Inject(ConfigService) config: ConfigService) {
    this.connectOnStartup = process.env.OPENAPI_GENERATION !== "true";
    this.pool = new Pool({
      connectionString: config.getOrThrow<string>("DATABASE_URL"),
      max: 10,
      connectionTimeoutMillis: 3000,
      statement_timeout: 5000,
    });
  }

  async onModuleInit(): Promise<void> {
    if (this.connectOnStartup) await this.pool.query("SELECT 1");
  }
  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
  query<T extends QueryResultRow>(
    sql: string,
    values: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, values);
  }
  async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
