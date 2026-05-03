import Database from '@tauri-apps/plugin-sql'
import { migrations } from './migrations'

let _db: Database | null = null
let _initPromise: Promise<Database> | null = null

export async function getDb(): Promise<Database> {
  if (_db) return _db
  if (!_initPromise) {
    _initPromise = (async () => {
      const db = await Database.load('sqlite:bd_tracker.db')
      await runMigrations(db)
      _db = db
      return db
    })().catch(err => {
      _initPromise = null
      throw err
    })
  }
  return _initPromise
}

async function runMigrations(db: Database): Promise<void> {
  // Ensure the migration tracking table exists first (migration 4)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `)

  // Fetch already-applied versions
  const applied = await db.select<{ version: number }[]>(
    'SELECT version FROM schema_migrations ORDER BY version ASC'
  )
  const appliedSet = new Set(applied.map((r) => r.version))

  for (const migration of migrations) {
    if (appliedSet.has(migration.version)) continue

    // SQLite doesn't support multiple statements in one execute() call,
    // so split on semicolons and run each non-empty statement individually.
    const statements = migration.sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const stmt of statements) {
      await db.execute(stmt)
    }

    await db.execute(
      'INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)',
      [migration.version]
    )
  }
}