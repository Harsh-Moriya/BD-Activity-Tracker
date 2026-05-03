import { getDb } from '../index'
import type { Organization } from '@/types/organization'

export async function dbGetAllOrganizations(): Promise<Organization[]> {
  const db = await getDb()
  return db.select<Organization[]>(
    'SELECT * FROM organizations ORDER BY name ASC'
  )
}

export async function dbCreateOrganization(
  data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const db = await getDb()
  const result = await db.execute(
    `INSERT INTO organizations (name, industry, website, notes)
     VALUES (?, ?, ?, ?)`,
    [data.name, data.industry ?? null, data.website ?? null, data.notes ?? null]
  )
  return result.lastInsertId ?? 0
}

export async function dbUpdateOrganization(
  id: number,
  data: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const db = await getDb()
  await db.execute(
    `UPDATE organizations
     SET name = ?, industry = ?, website = ?, notes = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
     WHERE id = ?`,
    [data.name ?? null, data.industry ?? null, data.website ?? null, data.notes ?? null, id]
  )
}

export async function dbDeleteOrganization(id: number): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM organizations WHERE id = ?', [id])
}
