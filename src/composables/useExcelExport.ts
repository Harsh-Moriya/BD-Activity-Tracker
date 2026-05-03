import XLSX from 'xlsx-js-style'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'
import type { Activity } from '@/types/activity'
import type { Organization } from '@/types/organization'
import { ACTIVITY_TYPES, ACTIVITY_STATUSES } from '@/types/activity'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'

// ── Date helpers ──────────────────────────────────────────────────────────────
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try { return format(new Date(iso), 'MMM d, yyyy') } catch { return iso }
}

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return ''
  try { return format(new Date(iso), 'MMM d, yyyy h:mm a') } catch { return iso }
}

function actDate(a: Activity): string {
  return a.scheduled_at ?? a.completed_at ?? a.created_at
}

function weekBounds(weeksBack: number): { from: string; to: string } {
  const d = subWeeks(new Date(), weeksBack)
  return {
    from: format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    to:   format(endOfWeek(d,   { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  }
}

function inRange(a: Activity, range: { from: string; to: string }): boolean {
  const end = range.to + 'T23:59:59Z'
  if (a.scheduled_at && a.scheduled_at >= range.from && a.scheduled_at <= end) return true
  if (a.completed_at && a.completed_at >= range.from && a.completed_at <= end) return true
  return false
}

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  navy:        '1B3A6B',
  blue:        '1E40AF',
  blueMid:     '2563EB',
  altRow:      'EFF6FF',
  white:       'FFFFFF',
  dark:        '111827',
  border:      'BFDBFE',
  borderDark:  '1D4ED8',
  emptyRow:    'F1F5F9',
  completedBg: 'D1FAE5', completedFg: '065F46',
  plannedBg:   'DBEAFE', plannedFg:   '1E40AF',
  followupBg:  'FEF3C7', followupFg:  '92400E',
  cancelledBg: 'FEE2E2', cancelledFg: '991B1B',
  norespBg:    'F3F4F6', norespFg:    '6B7280',
}

// ── Style builders ────────────────────────────────────────────────────────────
type CS = Record<string, unknown>

function bd(color = P.border) {
  const s = { style: 'thin', color: { rgb: color } }
  return { top: s, bottom: s, left: s, right: s }
}

const S = {
  title: (): CS => ({
    fill: { patternType: 'solid', fgColor: { rgb: P.navy } },
    font: { bold: true, color: { rgb: P.white }, sz: 13, name: 'Calibri' },
    alignment: { horizontal: 'left', vertical: 'center' },
  }),
  sectionHdr: (): CS => ({
    fill: { patternType: 'solid', fgColor: { rgb: P.blue } },
    font: { bold: true, color: { rgb: P.white }, sz: 11, name: 'Calibri' },
    alignment: { horizontal: 'left', vertical: 'center' },
  }),
  colHdr: (align: 'left' | 'center' = 'center'): CS => ({
    fill: { patternType: 'solid', fgColor: { rgb: P.blueMid } },
    font: { bold: true, color: { rgb: P.white }, sz: 10, name: 'Calibri' },
    alignment: { horizontal: align, vertical: 'center' },
    border: bd(P.borderDark),
  }),
  data: (alt: boolean, align: 'left' | 'right' | 'center' = 'left'): CS => ({
    fill: { patternType: 'solid', fgColor: { rgb: alt ? P.altRow : P.white } },
    font: { sz: 10, name: 'Calibri', color: { rgb: P.dark } },
    alignment: { horizontal: align, vertical: 'center', wrapText: true },
    border: bd(),
  }),
  status: (status: string): CS => {
    const map: Record<string, [string, string]> = {
      'Completed':           [P.completedBg, P.completedFg],
      'Planned':             [P.plannedBg,   P.plannedFg],
      'Follow-up Required':  [P.followupBg,  P.followupFg],
      'Cancelled':           [P.cancelledBg, P.cancelledFg],
      'No Response':         [P.norespBg,    P.norespFg],
    }
    const [bg, fg] = map[status] ?? [P.white, P.dark]
    return {
      fill: { patternType: 'solid', fgColor: { rgb: bg } },
      font: { bold: true, sz: 10, name: 'Calibri', color: { rgb: fg } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: bd(),
    }
  },
  empty: (): CS => ({
    fill: { patternType: 'solid', fgColor: { rgb: P.emptyRow } },
  }),
}

// ── Worksheet helpers ─────────────────────────────────────────────────────────
type WS = Record<string, unknown>

function applyStyle(ws: WS, row: number, col: number, style: CS) {
  const ref = XLSX.utils.encode_cell({ r: row, c: col })
  if (!ws[ref]) ws[ref] = { t: 's', v: '' }
  ;(ws[ref] as Record<string, unknown>).s = style
}

function setRowHeight(ws: WS, row: number, hpt: number) {
  if (!ws['!rows']) ws['!rows'] = []
  ;(ws['!rows'] as Array<{ hpt: number }>)[row] = { hpt }
}

// ── Sheet 1: Weekly Report ────────────────────────────────────────────────────
const WEEKLY_HEADERS = ['Type', 'Title', 'Organization', 'Contact', 'Date', 'Notes / Outcome']
const WEEKLY_NCOLS = WEEKLY_HEADERS.length

function buildWeeklySheet(
  allActivities: Activity[],
  orgFn: (id: number) => Organization | null,
): WS {
  const lastWeek = weekBounds(1)
  const thisWeek = weekBounds(0)
  const orgName = (a: Activity) =>
    a.organization_id ? (orgFn(a.organization_id)?.name ?? '') : ''

  const lastDone = allActivities.filter(a => inRange(a, lastWeek))
  const thisPlanned = allActivities.filter(a => inRange(a, thisWeek))

  const rows: (string | number)[][] = []
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = []
  type RowKind = 'title' | 'colhdr' | 'data' | 'empty'
  const kinds: RowKind[] = []

  const pushTitle = (text: string) => {
    const r = rows.length
    rows.push([text, ...Array(WEEKLY_NCOLS - 1).fill('')])
    merges.push({ s: { r, c: 0 }, e: { r, c: WEEKLY_NCOLS - 1 } })
    kinds.push('title')
  }
  const pushColHdrs = () => { rows.push(WEEKLY_HEADERS); kinds.push('colhdr') }
  const pushData = (acts: Activity[], emptyLabel: string) => {
    if (acts.length === 0) {
      rows.push([emptyLabel, ...Array(WEEKLY_NCOLS - 1).fill('')])
      kinds.push('data')
    } else {
      acts.forEach(a => {
        rows.push([
          a.type, a.title,
          orgName(a),
          a.contact_name ?? '',
          fmtDate(actDate(a)),
          [a.notes, a.outcome].filter(Boolean).join(' | '),
        ])
        kinds.push('data')
      })
    }
  }
  const pushEmpty = () => { rows.push(Array(WEEKLY_NCOLS).fill('')); kinds.push('empty') }

  pushTitle(`LAST WEEK  (${fmtDate(lastWeek.from)} – ${fmtDate(lastWeek.to)})`)
  pushColHdrs()
  pushData(lastDone, '(no completed activities last week)')
  pushEmpty()
  pushTitle(`THIS WEEK  (${fmtDate(thisWeek.from)} – ${fmtDate(thisWeek.to)})`)
  pushColHdrs()
  pushData(thisPlanned, '(no planned activities this week)')

  const ws: WS = XLSX.utils.aoa_to_sheet(rows) as WS
  ws['!cols'] = [{ wch: 16 }, { wch: 36 }, { wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 52 }]
  ws['!merges'] = merges

  let alt = false
  kinds.forEach((kind, r) => {
    if (kind === 'title') {
      for (let c = 0; c < WEEKLY_NCOLS; c++) applyStyle(ws, r, c, S.title())
      setRowHeight(ws, r, 22)
    } else if (kind === 'colhdr') {
      for (let c = 0; c < WEEKLY_NCOLS; c++)
        applyStyle(ws, r, c, S.colHdr(c === 4 ? 'center' : 'left'))
      setRowHeight(ws, r, 18)
      alt = false
    } else if (kind === 'data') {
      for (let c = 0; c < WEEKLY_NCOLS; c++)
        applyStyle(ws, r, c, S.data(alt, c === 4 ? 'center' : 'left'))
      setRowHeight(ws, r, 18)
      alt = !alt
    } else {
      for (let c = 0; c < WEEKLY_NCOLS; c++) applyStyle(ws, r, c, S.empty())
      setRowHeight(ws, r, 8)
    }
  })

  return ws
}

// ── Sheet 2: All Activities ───────────────────────────────────────────────────
const ALL_HEADERS = [
  'Type', 'Title', 'Status', 'Organization', 'Contact',
  'Email', 'Scheduled', 'Completed', 'Duration (min)', 'Notes', 'Outcome',
]
const ALL_NCOLS = ALL_HEADERS.length

function buildAllActivitiesSheet(
  activities: Activity[],
  orgFn: (id: number) => Organization | null,
): WS {
  const orgName = (a: Activity) =>
    a.organization_id ? (orgFn(a.organization_id)?.name ?? '') : ''

  const rows: (string | number)[][] = [ALL_HEADERS]
  activities.forEach(a => rows.push([
    a.type, a.title, a.status,
    orgName(a),
    a.contact_name ?? '', a.contact_email ?? '',
    fmtDateTime(a.scheduled_at), fmtDateTime(a.completed_at),
    a.duration_minutes ?? '',
    a.notes ?? '', a.outcome ?? '',
  ]))

  const ws: WS = XLSX.utils.aoa_to_sheet(rows) as WS
  ws['!cols'] = [
    { wch: 18 }, { wch: 36 }, { wch: 20 }, { wch: 22 }, { wch: 20 },
    { wch: 26 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 36 }, { wch: 36 },
  ]
  if (ws['!ref']) ws['!autofilter'] = { ref: ws['!ref'] }

  // Column header row
  for (let c = 0; c < ALL_NCOLS; c++)
    applyStyle(ws, 0, c, S.colHdr(c === 8 ? 'center' : 'left'))
  setRowHeight(ws, 0, 20)

  // Data rows
  for (let r = 1; r < rows.length; r++) {
    const alt = r % 2 === 0
    const status = rows[r][2] as string
    for (let c = 0; c < ALL_NCOLS; c++) {
      if (c === 2) applyStyle(ws, r, c, S.status(status))
      else if (c === 8) applyStyle(ws, r, c, S.data(alt, 'center'))
      else applyStyle(ws, r, c, S.data(alt))
    }
    setRowHeight(ws, r, 18)
  }

  return ws
}

// ── Sheet 3: Stats Summary ────────────────────────────────────────────────────
function buildStatsSheet(
  activities: Activity[],
  orgFn: (id: number) => Organization | null,
  dateRange: { from: string; to: string },
): WS {
  const total = activities.length
  const completed = activities.filter(a => a.status === 'Completed').length

  const byType: Record<string, number> = {}
  ACTIVITY_TYPES.forEach(t => { byType[t] = 0 })
  activities.forEach(a => { byType[a.type] = (byType[a.type] ?? 0) + 1 })

  const byStatus: Record<string, number> = {}
  ACTIVITY_STATUSES.forEach(s => { byStatus[s] = 0 })
  activities.forEach(a => { byStatus[a.status] = (byStatus[a.status] ?? 0) + 1 })

  const orgCounts: Record<number, number> = {}
  activities.forEach(a => {
    if (a.organization_id) orgCounts[a.organization_id] = (orgCounts[a.organization_id] ?? 0) + 1
  })
  const top5 = Object.entries(orgCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, n]) => [orgFn(Number(id))?.name ?? `Org #${id}`, n] as [string, number])

  const rows: (string | number)[][] = []
  const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = []
  type RowKind = 'title' | 'section' | 'data' | 'empty'
  const kinds: RowKind[] = []

  const pushTitle = (text: string) => {
    const r = rows.length; rows.push([text, ''])
    merges.push({ s: { r, c: 0 }, e: { r, c: 1 } }); kinds.push('title')
  }
  const pushSection = (text: string) => {
    const r = rows.length; rows.push([text, ''])
    merges.push({ s: { r, c: 0 }, e: { r, c: 1 } }); kinds.push('section')
  }
  const pushData = (label: string, value: string | number) => {
    rows.push([label, value]); kinds.push('data')
  }
  const pushEmpty = () => { rows.push(['', '']); kinds.push('empty') }

  pushTitle(`BD Activity Report: ${fmtDate(dateRange.from)} – ${fmtDate(dateRange.to)}`)
  pushEmpty()
  pushSection('SUMMARY')
  pushData('Total Activities', total)
  pushData('Completed', completed)
  pushEmpty()
  pushSection('BY TYPE')
  ACTIVITY_TYPES.forEach(t => { if (byType[t] > 0) pushData(t, byType[t]) })
  pushEmpty()
  pushSection('BY STATUS')
  ACTIVITY_STATUSES.forEach(s => pushData(s, byStatus[s]))
  pushEmpty()
  pushSection('TOP ORGANIZATIONS')
  if (top5.length === 0) pushData('(no org-linked activities in range)', '')
  else top5.forEach(([name, n]) => pushData(name, n))

  const ws: WS = XLSX.utils.aoa_to_sheet(rows) as WS
  ws['!cols'] = [{ wch: 34 }, { wch: 18 }]
  ws['!merges'] = merges

  let alt = false
  kinds.forEach((kind, r) => {
    if (kind === 'title') {
      applyStyle(ws, r, 0, S.title()); applyStyle(ws, r, 1, S.title())
      setRowHeight(ws, r, 26)
    } else if (kind === 'section') {
      applyStyle(ws, r, 0, S.sectionHdr()); applyStyle(ws, r, 1, S.sectionHdr())
      setRowHeight(ws, r, 18)
      alt = false
    } else if (kind === 'data') {
      applyStyle(ws, r, 0, S.data(alt))
      applyStyle(ws, r, 1, S.data(alt, 'right'))
      setRowHeight(ws, r, 18)
      alt = !alt
    } else {
      applyStyle(ws, r, 0, S.empty()); applyStyle(ws, r, 1, S.empty())
      setRowHeight(ws, r, 8)
    }
  })

  return ws
}

// ── Export ────────────────────────────────────────────────────────────────────
export function useExcelExport() {
  async function exportToExcel(
    allActivities: Activity[],
    activitiesInRange: Activity[],
    orgFn: (id: number) => Organization | null,
    dateRange: { from: string; to: string },
  ): Promise<boolean> {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, buildWeeklySheet(allActivities, orgFn) as never, 'Weekly Report')
    XLSX.utils.book_append_sheet(wb, buildAllActivitiesSheet(activitiesInRange, orgFn) as never, 'All Activities')
    XLSX.utils.book_append_sheet(wb, buildStatsSheet(activitiesInRange, orgFn, dateRange) as never, 'Stats Summary')

    const defaultName = `BD_Report_${dateRange.from}_to_${dateRange.to}.xlsx`
    const savePath = await save({
      defaultPath: defaultName,
      filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }],
    })
    if (!savePath) return false

    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array
    await writeFile(savePath, buffer)
    return true
  }

  return { exportToExcel }
}
