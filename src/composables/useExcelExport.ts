import * as XLSX from 'xlsx'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'
import type { Activity } from '@/types/activity'
import type { Organization } from '@/types/organization'
import { ACTIVITY_TYPES, ACTIVITY_STATUSES } from '@/types/activity'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'

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
  const d = actDate(a)
  return d >= range.from && d <= range.to + 'T23:59:59Z'
}

const WEEKLY_HEADERS = ['Type', 'Title', 'Organization', 'Contact', 'Date', 'Notes / Outcome']

function actWeeklyRow(a: Activity, orgName: string): string[] {
  return [
    a.type,
    a.title,
    orgName,
    a.contact_name ?? '',
    fmtDate(actDate(a)),
    [a.notes, a.outcome].filter(Boolean).join(' | '),
  ]
}

function buildWeeklySheet(
  allActivities: Activity[],
  orgFn: (id: number) => Organization | null
): (string | number)[][] {
  const lastWeek = weekBounds(1)
  const thisWeek = weekBounds(0)

  const orgName = (a: Activity) =>
    a.organization_id ? (orgFn(a.organization_id)?.name ?? '') : ''

  const lastWeekCompleted = allActivities.filter(
    a => inRange(a, lastWeek) && a.status === 'Completed'
  )
  const thisWeekPlanned = allActivities.filter(
    a => inRange(a, thisWeek) && (a.status === 'Planned' || a.status === 'Follow-up Required')
  )

  const rows: (string | number)[][] = []

  rows.push([`LAST WEEK: COMPLETED  (${fmtDate(lastWeek.from)} - ${fmtDate(lastWeek.to)})`, '', '', '', '', ''])
  rows.push(WEEKLY_HEADERS)
  if (lastWeekCompleted.length === 0) {
    rows.push(['(no completed activities last week)', '', '', '', '', ''])
  } else {
    lastWeekCompleted.forEach(a => rows.push(actWeeklyRow(a, orgName(a))))
  }

  rows.push(['', '', '', '', '', ''])

  rows.push([`THIS WEEK: PLANNED  (${fmtDate(thisWeek.from)} - ${fmtDate(thisWeek.to)})`, '', '', '', '', ''])
  rows.push(WEEKLY_HEADERS)
  if (thisWeekPlanned.length === 0) {
    rows.push(['(no planned activities this week)', '', '', '', '', ''])
  } else {
    thisWeekPlanned.forEach(a => rows.push(actWeeklyRow(a, orgName(a))))
  }

  return rows
}

const ALL_HEADERS = [
  'Type', 'Title', 'Status', 'Organization', 'Contact Name',
  'Contact Email', 'Scheduled', 'Completed', 'Duration (min)', 'Notes', 'Outcome',
]

function buildAllActivitiesSheet(
  activities: Activity[],
  orgFn: (id: number) => Organization | null
): (string | number)[][] {
  const orgName = (a: Activity) =>
    a.organization_id ? (orgFn(a.organization_id)?.name ?? '') : ''

  const rows: (string | number)[][] = [ALL_HEADERS]
  activities.forEach(a => {
    rows.push([
      a.type,
      a.title,
      a.status,
      orgName(a),
      a.contact_name ?? '',
      a.contact_email ?? '',
      fmtDateTime(a.scheduled_at),
      fmtDateTime(a.completed_at),
      a.duration_minutes ?? '',
      a.notes ?? '',
      a.outcome ?? '',
    ])
  })
  return rows
}

function buildStatsSheet(
  activities: Activity[],
  orgFn: (id: number) => Organization | null,
  dateRange: { from: string; to: string }
): (string | number)[][] {
  const total = activities.length
  const completed = activities.filter(a => a.status === 'Completed').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

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
    .map(([idStr, count]) => {
      const org = orgFn(Number(idStr))
      return [org?.name ?? `Org #${idStr}`, count] as [string, number]
    })

  const rows: (string | number)[][] = []
  rows.push([`BD Activity Report: ${fmtDate(dateRange.from)} to ${fmtDate(dateRange.to)}`, ''])
  rows.push(['', ''])
  rows.push(['SUMMARY', ''])
  rows.push(['Total Activities', total])
  rows.push(['Completed', completed])
  rows.push(['Completion Rate', `${completionRate}%`])
  rows.push(['', ''])
  rows.push(['BY TYPE', ''])
  ACTIVITY_TYPES.forEach(type => {
    if (byType[type] > 0) rows.push([type, byType[type]])
  })
  rows.push(['', ''])
  rows.push(['BY STATUS', ''])
  ACTIVITY_STATUSES.forEach(status => rows.push([status, byStatus[status]]))
  rows.push(['', ''])
  rows.push(['TOP ORGANIZATIONS', ''])
  if (top5.length === 0) {
    rows.push(['(no org-linked activities in range)', ''])
  } else {
    top5.forEach(([name, count]) => rows.push([name, count]))
  }
  return rows
}

export function useExcelExport() {
  async function exportToExcel(
    allActivities: Activity[],
    activitiesInRange: Activity[],
    orgFn: (id: number) => Organization | null,
    dateRange: { from: string; to: string }
  ): Promise<boolean> {
    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.aoa_to_sheet(buildWeeklySheet(allActivities, orgFn))
    ws1['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 50 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Weekly Report')

    const ws2 = XLSX.utils.aoa_to_sheet(buildAllActivitiesSheet(activitiesInRange, orgFn))
    ws2['!cols'] = [
      { wch: 18 }, { wch: 35 }, { wch: 20 }, { wch: 22 }, { wch: 20 },
      { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 35 }, { wch: 35 },
    ]
    if (ws2['!ref']) ws2['!autofilter'] = { ref: ws2['!ref'] }
    XLSX.utils.book_append_sheet(wb, ws2, 'All Activities')

    const ws3 = XLSX.utils.aoa_to_sheet(buildStatsSheet(activitiesInRange, orgFn, dateRange))
    ws3['!cols'] = [{ wch: 32 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Stats Summary')

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
