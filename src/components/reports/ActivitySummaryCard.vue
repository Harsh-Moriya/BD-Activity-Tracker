<script setup lang="ts">
import type { Activity } from '@/types/activity'
import TypeIcon from '@/components/activities/TypeIcon.vue'
import StatusBadge from '@/components/activities/StatusBadge.vue'
import { TYPE_ACCENT_BORDER } from '@/lib/activity-styles'
import { format } from 'date-fns'

const props = defineProps<{
  activity: Activity
  orgName: string | null
}>()

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try { return format(new Date(iso), 'MMM d') } catch { return '' }
}

const date = props.activity.scheduled_at ?? props.activity.completed_at ?? null
</script>

<template>
  <div class="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm"
    :class="TYPE_ACCENT_BORDER[activity.type]" style="border-left-width: 3px">

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <div class="space-x-2.5 flex items-center">
          <TypeIcon :type="activity.type" class="h-4 w-4 text-muted-foreground" />
          <p class="font-medium text-foreground truncate">{{ activity.title }}</p>
        </div>
        <span class="shrink-0 text-xs text-muted-foreground">{{ fmtDate(date) }}</span>
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge :status="activity.status" />
        <span v-if="orgName" class="text-xs text-muted-foreground truncate">{{ orgName }}</span>
        <span v-if="activity.contact_name" class="text-xs text-muted-foreground">· {{ activity.contact_name }}</span>
      </div>
      <p v-if="activity.notes || activity.outcome" class="mt-1 text-xs text-muted-foreground line-clamp-2">
        {{ activity.outcome || activity.notes }}
      </p>
    </div>
  </div>
</template>
