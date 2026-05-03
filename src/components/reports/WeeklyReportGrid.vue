<script setup lang="ts">
import { computed } from 'vue'
import type { Activity } from '@/types/activity'
import type { Organization } from '@/types/organization'
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import ActivitySummaryCard from './ActivitySummaryCard.vue'

const props = defineProps<{
  activities: Activity[]
  orgById: (id: number) => Organization | null
}>()

function weekBounds(weeksBack: number) {
  const d = subWeeks(new Date(), weeksBack)
  return {
    from: format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    to:   format(endOfWeek(d,   { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    label: `${format(startOfWeek(d, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(d, { weekStartsOn: 1 }), 'MMM d, yyyy')}`,
  }
}

const lastWeek = weekBounds(1)
const thisWeek = weekBounds(0)

function inRange(a: Activity, range: { from: string; to: string }): boolean {
  const end = range.to + 'T23:59:59Z'
  if (a.scheduled_at && a.scheduled_at >= range.from && a.scheduled_at <= end) return true
  if (a.completed_at && a.completed_at >= range.from && a.completed_at <= end) return true
  return false
}

function sortByDate(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const da = a.scheduled_at ?? a.completed_at ?? a.created_at
    const db = b.scheduled_at ?? b.completed_at ?? b.created_at
    return da.localeCompare(db)
  })
}

const lastWeekActivities = computed(() =>
  sortByDate(props.activities.filter(a => inRange(a, lastWeek)))
)

const thisWeekActivities = computed(() =>
  sortByDate(props.activities.filter(a => inRange(a, thisWeek)))
)

function orgName(a: Activity): string | null {
  return a.organization_id ? (props.orgById(a.organization_id)?.name ?? null) : null
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <!-- Last Week -->
    <div class="rounded-lg border border-border bg-card">
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 class="font-semibold text-foreground">Last Week</h3>
          <p class="text-xs text-muted-foreground mt-0.5">{{ lastWeek.label }}</p>
        </div>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="lastWeekActivities.length > 0 ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground'"
        >
          {{ lastWeekActivities.length }}
        </span>
      </div>
      <div class="p-3 space-y-2 max-h-96 overflow-y-auto">
        <ActivitySummaryCard
          v-for="a in lastWeekActivities"
          :key="a.id"
          :activity="a"
          :org-name="orgName(a)"
        />
        <div v-if="lastWeekActivities.length === 0" class="py-8 text-center text-sm text-muted-foreground">
          No activities last week
        </div>
      </div>
    </div>

    <!-- This Week -->
    <div class="rounded-lg border border-border bg-card">
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 class="font-semibold text-foreground">This Week</h3>
          <p class="text-xs text-muted-foreground mt-0.5">{{ thisWeek.label }}</p>
        </div>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="thisWeekActivities.length > 0 ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground'"
        >
          {{ thisWeekActivities.length }}
        </span>
      </div>
      <div class="p-3 space-y-2 max-h-96 overflow-y-auto">
        <ActivitySummaryCard
          v-for="a in thisWeekActivities"
          :key="a.id"
          :activity="a"
          :org-name="orgName(a)"
        />
        <div v-if="thisWeekActivities.length === 0" class="py-8 text-center text-sm text-muted-foreground">
          No activities this week
        </div>
      </div>
    </div>
  </div>
</template>
