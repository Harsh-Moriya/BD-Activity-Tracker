export type ActivityType =
  | 'Call'
  | 'Meeting'
  | 'Email'
  | 'LinkedIn Message'
  | 'WhatsApp Message'
  | 'Demo'
  | 'Proposal'
  | 'Contract'
  | 'Other'

export type ActivityStatus =
  | 'Planned'
  | 'Completed'
  | 'Cancelled'
  | 'No Response'
  | 'Follow-up Required'
  | 'Positive'
  | 'Pending'
  | 'Declined'
  | 'In Progress'
  | 'Action Required'

export type Direction = 'Inbound' | 'Outbound'

export const ACTIVITY_TYPES: ActivityType[] = [
  'Call', 'Meeting', 'Email', 'LinkedIn Message', 'WhatsApp Message',
  'Demo', 'Proposal', 'Contract', 'Other',
]

export const ACTIVITY_STATUSES: ActivityStatus[] = [
  'Planned', 'Completed', 'Cancelled', 'No Response', 'Follow-up Required',
  'Positive', 'Pending', 'Declined', 'In Progress', 'Action Required',
]

// Type-specific metadata shapes
export interface CallMetadata { direction?: Direction }
export interface MeetingMetadata { location?: string; attendees?: number }
export interface EmailMetadata { direction?: Direction }
export interface ProposalMetadata { value?: number; currency?: string }
export interface ContractMetadata { value?: number; currency?: string; signed?: boolean }
export type ActivityMetadata =
  | CallMetadata
  | MeetingMetadata
  | EmailMetadata
  | ProposalMetadata
  | ContractMetadata
  | Record<string, never>

export interface Activity {
  id: number
  type: ActivityType
  title: string
  status: ActivityStatus
  organization_id: number | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  scheduled_at: string | null
  completed_at: string | null
  duration_minutes: number | null
  direction: Direction | null
  notes: string | null
  outcome: string | null
  parent_activity_id: number | null
  metadata: string   // JSON string - parse with JSON.parse
  created_at: string
  updated_at: string
}

export interface ActivityFilters {
  dateFrom: string | null
  dateTo: string | null
  types: ActivityType[]
  statuses: ActivityStatus[]
  organizationId: number | null
  searchQuery: string
}

export function emptyFilters(): ActivityFilters {
  return {
    dateFrom: null,
    dateTo: null,
    types: [],
    statuses: [],
    organizationId: null,
    searchQuery: '',
  }
}

export function parseMeta<T = ActivityMetadata>(raw: string): T {
  try { return JSON.parse(raw) as T } catch { return {} as T }
}
