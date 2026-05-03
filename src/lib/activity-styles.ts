import type { ActivityType, ActivityStatus } from '@/types/activity'

export const TYPE_ACCENT_BORDER: Record<ActivityType, string> = {
  'Call':              'border-l-blue-400',
  'Meeting':           'border-l-green-500',
  'Email':             'border-l-amber-400',
  'LinkedIn Message':  'border-l-blue-600',
  'WhatsApp Message':  'border-l-teal-500',
  'Demo':              'border-l-violet-500',
  'Proposal':          'border-l-orange-500',
  'Contract':          'border-l-emerald-500',
  'Other':             'border-l-slate-400',
}

export const TYPE_ICON_BG: Record<ActivityType, string> = {
  'Call':              'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  'Meeting':           'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  'Email':             'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  'LinkedIn Message':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'WhatsApp Message':  'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  'Demo':              'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  'Proposal':          'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  'Contract':          'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Other':             'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
}

export const TYPE_PILL_ACTIVE: Record<ActivityType, string> = {
  'Call':              'border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Meeting':           'border-green-300 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Email':             'border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'LinkedIn Message':  'border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  'WhatsApp Message':  'border-teal-300 bg-teal-100 text-teal-700 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Demo':              'border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'Proposal':          'border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Contract':          'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Other':             'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
}

export const STATUS_BADGE_CLASS: Record<ActivityStatus, string> = {
  'Planned':            'bg-muted text-muted-foreground',
  'Completed':          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Cancelled':          'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  'No Response':        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Follow-up Required': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Positive':           'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Pending':            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Declined':           'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'In Progress':        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Action Required':    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

export const STATUS_PILL_ACTIVE: Record<ActivityStatus, string> = {
  'Planned':            'border-muted-foreground/30 bg-muted text-muted-foreground',
  'Completed':          'border-green-300 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Cancelled':          'border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400',
  'No Response':        'border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Follow-up Required': 'border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Positive':           'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Pending':            'border-yellow-300 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Declined':           'border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400',
  'In Progress':        'border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Action Required':    'border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}
