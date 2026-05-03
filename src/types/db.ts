// Minimal type shim for @tauri-apps/plugin-sql result shapes

export interface QueryResult {
  lastInsertId: number
  rowsAffected: number
}
