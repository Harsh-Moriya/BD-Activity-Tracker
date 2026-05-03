export interface Organization {
  id: number
  name: string
  industry: string | null
  website: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrgSelectOption {
  value: number
  label: string
}
