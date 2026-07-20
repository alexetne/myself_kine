import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client } from 'pg';

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migration (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const directory = resolve(process.cwd(), 'migrations');
    const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
      const applied = await client.query('SELECT 1 FROM schema_migration WHERE version = $1', [file]);
      if (applied.rowCount) continue;
      const sql = await readFile(resolve(directory, file), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO schema_migration(version) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
      process.stdout.write(`Applied ${file}\n`);
    }
  } finally {
    await client.end();
  }
}

void main();
