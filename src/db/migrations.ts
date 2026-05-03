// Each entry: { version, sql }
// Applied in order; already-applied versions are skipped via schema_migrations table.

export interface Migration {
  version: number
  sql: string
}

export const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS organizations (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        industry    TEXT,
        website     TEXT,
        notes       TEXT,
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
        updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      );
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS activities (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        type                TEXT NOT NULL CHECK(type IN (
                                'Call','Meeting','Email','LinkedIn Message',
                                'Demo','Proposal','Contract','Other'
                            )),
        title               TEXT NOT NULL,
        status              TEXT NOT NULL DEFAULT 'Planned' CHECK(status IN (
                                'Planned','Completed','Cancelled',
                                'No Response','Follow-up Required'
                            )),
        organization_id     INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
        contact_name        TEXT,
        contact_email       TEXT,
        contact_phone       TEXT,
        scheduled_at        TEXT,
        completed_at        TEXT,
        duration_minutes    INTEGER,
        direction           TEXT CHECK(direction IN ('Inbound','Outbound')),
        notes               TEXT,
        outcome             TEXT,
        parent_activity_id  INTEGER REFERENCES activities(id) ON DELETE SET NULL,
        metadata            TEXT NOT NULL DEFAULT '{}',
        created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
        updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      );
    `,
  },
  {
    version: 3,
    sql: `
      CREATE INDEX IF NOT EXISTS idx_activities_type         ON activities(type);
      CREATE INDEX IF NOT EXISTS idx_activities_status       ON activities(status);
      CREATE INDEX IF NOT EXISTS idx_activities_scheduled_at ON activities(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_activities_org_id       ON activities(organization_id);
      CREATE INDEX IF NOT EXISTS idx_activities_parent_id    ON activities(parent_activity_id);
    `,
  },
  {
    version: 4,
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      );
    `,
  },
  {
    version: 5,
    sql: `
      DROP TABLE IF EXISTS activities_v2;
      CREATE TABLE activities_v2 (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        type                TEXT NOT NULL CHECK(type IN (
                                'Call','Meeting','Email','LinkedIn Message','WhatsApp Message',
                                'Demo','Proposal','Contract','Other'
                            )),
        title               TEXT NOT NULL,
        status              TEXT NOT NULL DEFAULT 'Planned' CHECK(status IN (
                                'Planned','Completed','Cancelled',
                                'No Response','Follow-up Required',
                                'Positive','Pending','Declined','In Progress','Action Required'
                            )),
        organization_id     INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
        contact_name        TEXT,
        contact_email       TEXT,
        contact_phone       TEXT,
        scheduled_at        TEXT,
        completed_at        TEXT,
        duration_minutes    INTEGER,
        direction           TEXT CHECK(direction IN ('Inbound','Outbound')),
        notes               TEXT,
        outcome             TEXT,
        parent_activity_id  INTEGER REFERENCES activities_v2(id) ON DELETE SET NULL,
        metadata            TEXT NOT NULL DEFAULT '{}',
        created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
        updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
      );
      INSERT INTO activities_v2 SELECT * FROM activities;
      DROP TABLE activities;
      ALTER TABLE activities_v2 RENAME TO activities;
      CREATE INDEX IF NOT EXISTS idx_activities_type         ON activities(type);
      CREATE INDEX IF NOT EXISTS idx_activities_status       ON activities(status);
      CREATE INDEX IF NOT EXISTS idx_activities_scheduled_at ON activities(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_activities_org_id       ON activities(organization_id);
      CREATE INDEX IF NOT EXISTS idx_activities_parent_id    ON activities(parent_activity_id)
    `,
  },
]
