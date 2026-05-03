import { getDb } from '../index'
import type { Activity, ActivityStatus } from '@/types/activity'

export async function dbGetAllActivities(): Promise<Activity[]> {
  const db = await getDb()
  return db.select<Activity[]>(
    'SELECT * FROM activities ORDER BY scheduled_at DESC, created_at DESC'
  )
}

export async function dbCreateActivity(
  data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const db = await getDb()
  const result = await db.execute(
    `INSERT INTO activities
       (type, title, status, organization_id, contact_name, contact_email,
        contact_phone, scheduled_at, completed_at, duration_minutes,
        direction, notes, outcome, parent_activity_id, metadata)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.type,
      data.title,
      data.status,
      data.organization_id ?? null,
      data.contact_name ?? null,
      data.contact_email ?? null,
      data.contact_phone ?? null,
      data.scheduled_at ?? null,
      data.completed_at ?? null,
      data.duration_minutes ?? null,
      data.direction ?? null,
      data.notes ?? null,
      data.outcome ?? null,
      data.parent_activity_id ?? null,
      data.metadata ?? '{}',
    ]
  )
  return result.lastInsertId ?? 0
}

export async function dbUpdateActivity(
  id: number,
  data: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const db = await getDb()
  await db.execute(
    `UPDATE activities
     SET type = COALESCE(?, type),
         title = COALESCE(?, title),
         status = COALESCE(?, status),
         organization_id = ?,
         contact_name = ?,
         contact_email = ?,
         contact_phone = ?,
         scheduled_at = ?,
         completed_at = ?,
         duration_minutes = ?,
         direction = ?,
         notes = ?,
         outcome = ?,
         parent_activity_id = ?,
         metadata = COALESCE(?, metadata),
         updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
     WHERE id = ?`,
    [
      data.type ?? null,
      data.title ?? null,
      data.status ?? null,
      data.organization_id ?? null,
      data.contact_name ?? null,
      data.contact_email ?? null,
      data.contact_phone ?? null,
      data.scheduled_at ?? null,
      data.completed_at ?? null,
      data.duration_minutes ?? null,
      data.direction ?? null,
      data.notes ?? null,
      data.outcome ?? null,
      data.parent_activity_id ?? null,
      data.metadata ?? null,
      id,
    ]
  )
}

export async function dbUpdateActivityStatus(
  id: number,
  status: ActivityStatus
): Promise<void> {
  const db = await getDb()
  await db.execute(
    `UPDATE activities
     SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
     WHERE id = ?`,
    [status, id]
  )
}

export async function dbDeleteActivity(id: number): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM activities WHERE id = ?', [id])
}
