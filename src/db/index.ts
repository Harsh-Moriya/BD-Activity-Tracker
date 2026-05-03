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
      await seedDemoData(db)
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

async function seedDemoData(db: Database): Promise<void> {
  const [{ count: actCount }] = await db.select<[{ count: number }]>(
    'SELECT COUNT(*) as count FROM activities',
  )
  const [{ count: orgCount }] = await db.select<[{ count: number }]>(
    'SELECT COUNT(*) as count FROM organizations',
  )
  if (actCount > 0 || orgCount > 0) return

  const r1 = await db.execute(
    'INSERT INTO organizations (name, industry, website, notes) VALUES (?,?,?,?)',
    ['Acme Corp', 'Technology', 'https://acme.com', 'Key enterprise account. Procurement lead: Jane Doe.'],
  )
  const acmeId = Number(r1.lastInsertId ?? 1)

  const r2 = await db.execute(
    'INSERT INTO organizations (name, industry, website) VALUES (?,?,?)',
    ['TechVentures Ltd', 'Venture Capital', 'https://techventures.io'],
  )
  const tvId = Number(r2.lastInsertId ?? 2)

  const r3 = await db.execute(
    'INSERT INTO organizations (name, industry, notes) VALUES (?,?,?)',
    ['GlobalSoft Inc', 'Enterprise Software', 'Mid-market deal. CTO is primary contact.'],
  )
  const gsId = Number(r3.lastInsertId ?? 3)

  // [type, title, status, org_id, contact_name, contact_email, contact_phone,
  //  scheduled_at, completed_at, duration_minutes, direction, notes, outcome, parent_id, metadata]
  type Row = [string, string, string, number, string|null, string|null, string|null,
              string|null, string|null, number|null, string|null, string|null, string|null,
              number|null, string]

  const acts: Row[] = [
    ['Call',             'Discovery call with Acme Corp',            'Completed',           acmeId, 'Jane Doe',  'jane@acme.com',     null, '2026-04-14T10:00:00Z', '2026-04-14T10:45:00Z', 45,  'Outbound', 'Good intro. Jane is interested in the Q2 proposal.',              'Positive: proceed to proposal.',          null, '{}'],
    ['Meeting',          'Kick-off meeting: Acme Q2 project',        'Completed',           acmeId, 'Jane Doe',  'jane@acme.com',     null, '2026-04-16T14:00:00Z', '2026-04-16T15:30:00Z', 90,  null,       'Discussed scope, timeline, and budget.',                          'Agreed on SOW draft by April 22.',        null, '{"location":"Zoom","attendees":4}'],
    ['Email',            'Sent SOW draft to Acme',                   'Completed',           acmeId, 'Jane Doe',  'jane@acme.com',     null, '2026-04-17T09:00:00Z', '2026-04-17T09:00:00Z', null,'Outbound', 'Attached SOW v1.0 and pricing sheet.',                            'Awaiting review.',                        null, '{}'],
    ['LinkedIn Message', 'Prospecting: VP Sales at TechVentures',    'No Response',         tvId,   'Mark Chen', null,                null, '2026-04-18T11:00:00Z', null,                    null, null,      'Sent intro message about BD services.',                           null,                                      null, '{}'],
    ['Demo',             'Product demo for TechVentures',            'Completed',           tvId,   'Mark Chen', 'mark@tv.io',        null, '2026-04-21T15:00:00Z', '2026-04-21T16:00:00Z', 60,  null,       'Full product walkthrough. Strong interest in reporting module.',   'Will send proposal.',                     null, '{"location":"Google Meet","attendees":3}'],
    ['Proposal',         'Q2 Services Proposal: Acme',               'Follow-up Required',  acmeId, 'Jane Doe',  'jane@acme.com',     null, '2026-04-22T09:00:00Z', null,                    null, null,      'Sent $45k proposal for Q2 engagement.',                           null,                                      null, '{"value":45000,"currency":"USD"}'],
    ['Call',             'Check-in call: Acme',                      'Cancelled',           acmeId, 'Jane Doe',  'jane@acme.com',     null, '2026-04-24T10:00:00Z', null,                    30,  'Outbound', 'Jane cancelled, rescheduling next week.',                         null,                                      null, '{}'],
    ['Email',            'Inbound inquiry: GlobalSoft',              'Completed',           gsId,   'Tom Willis','tom@globalsoft.com', null, '2026-04-25T08:30:00Z', '2026-04-25T08:30:00Z', null,'Inbound',  'Tom reached out about enterprise pricing.',                       'Responded same day, demo scheduled.',     null, '{}'],
    ['Meeting',          'Contract review: TechVentures',            'Completed',           tvId,   'Mark Chen', 'mark@tv.io',        null, '2026-04-28T13:00:00Z', '2026-04-28T14:00:00Z', 60,  null,       'Reviewed contract terms. One revision requested.',                'Final version sent April 29.',            null, '{"location":"In-person","attendees":5}'],
    ['Contract',         'Service Agreement: TechVentures Q2',       'Completed',           tvId,   'Mark Chen', 'mark@tv.io',        null, '2026-04-29T10:00:00Z', '2026-04-29T10:00:00Z', null, null,      'Signed service agreement for Q2.',                                'Deal closed.',                            null, '{"value":75000,"currency":"USD","signed":true}'],
    ['LinkedIn Message', 'Follow-up with GlobalSoft CTO',            'Completed',           gsId,   'Tom Willis','tom@globalsoft.com', null, '2026-04-30T09:00:00Z', '2026-04-30T09:00:00Z', null, null,      'Confirmed demo appointment for May 6.',                           'Demo confirmed.',                         null, '{}'],
    ['Other',            'Internal deal notes: GlobalSoft',          'Completed',           gsId,   null,        null,                null, '2026-05-01T10:00:00Z', '2026-05-01T10:00:00Z', null, null,      'GlobalSoft seems ready to move. Budget confirmed $100-150k. Decision expected in May.', null, null, '{}'],
    ['Demo',             'Technical demo: GlobalSoft',               'Planned',             gsId,   'Tom Willis','tom@globalsoft.com', null, '2026-05-06T14:00:00Z', null,                    60,  null,       'Detailed walkthrough including integrations.',                     null,                                      null, '{"location":"Zoom","attendees":4}'],
    ['Call',             'Weekly check-in: Acme Corp',               'Planned',             acmeId, 'Jane Doe',  'jane@acme.com',     null, '2026-05-07T10:00:00Z', null,                    30,  'Outbound', null,                                                              null,                                      null, '{}'],
    ['Meeting',          'Quarterly business review: GlobalSoft',    'Planned',             gsId,   'Tom Willis','tom@globalsoft.com', null, '2026-05-10T09:00:00Z', null,                    120, null,       'Q1 results review and Q2 planning.',                              null,                                      null, '{"location":"Client office","attendees":6}'],
    ['Proposal',         'Enterprise Contract Proposal: GlobalSoft', 'Planned',             gsId,   'Tom Willis','tom@globalsoft.com', null, '2026-05-12T09:00:00Z', null,                    null, null,      'Full-year enterprise engagement at $120k.',                       null,                                      null, '{"value":120000,"currency":"USD"}'],
  ]

  for (const a of acts) {
    await db.execute(
      `INSERT INTO activities
         (type, title, status, organization_id, contact_name, contact_email, contact_phone,
          scheduled_at, completed_at, duration_minutes, direction, notes, outcome,
          parent_activity_id, metadata)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      a,
    )
  }
}
