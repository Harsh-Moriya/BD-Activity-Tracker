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
  const d = a.scheduled_at ?? a.completed_at ?? a.created_at
  return d >= range.from && d <= range.to + 'T23:59:59Z'
}

const lastWeekCompleted = computed(() =>
  props.activities
    .filter(a => inRange(a, lastWeek) && a.status === 'Completed')
    .sort((a, b) => {
      const da = a.scheduled_at ?? a.completed_at ?? a.created_at
      const db = b.scheduled_at ?? b.completed_at ?? b.created_at
      return da.localeCompare(db)
    })
)

const thisWeekPlanned = computed(() =>
  props.activities
    .filter(a => inRange(a, thisWeek) && (a.status === 'Planned' || a.status === 'Follow-up Required'))
    .sort((a, b) => {
      const da = a.scheduled_at ?? a.completed_at ?? a.created_at
      const db = b.scheduled_at ?? b.completed_at ?? b.created_at
      return da.localeCompare(db)
    })
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
          <h3 class="font-semibold text-foreground">Last Week: Completed</h3>
          <p class="text-xs text-muted-foreground mt-0.5">{{ lastWeek.label }}</p>
        </div>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="lastWeekCompleted.length > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'"
        >
          {{ lastWeekCompleted.length }}
        </span>
      </div>
      <div class="p-3 space-y-2 max-h-96 overflow-y-auto">
        <ActivitySummaryCard
          v-for="a in lastWeekCompleted"
          :key="a.id"
          :activity="a"
          :org-name="orgName(a)"
        />
        <div v-if="lastWeekCompleted.length === 0" class="py-8 text-center text-sm text-muted-foreground">
          No completed activities last week
        </div>
      </div>
    </div>

    <!-- This Week -->
    <div class="rounded-lg border border-border bg-card">
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 class="font-semibold text-foreground">This Week: Planned</h3>
          <p class="text-xs text-muted-foreground mt-0.5">{{ thisWeek.label }}</p>
        </div>
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="thisWeekPlanned.length > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-muted text-muted-foreground'"
        >
          {{ thisWeekPlanned.length }}
        </span>
      </div>
      <div class="p-3 space-y-2 max-h-96 overflow-y-auto">
        <ActivitySummaryCard
          v-for="a in thisWeekPlanned"
          :key="a.id"
          :activity="a"
          :org-name="orgName(a)"
        />
        <div v-if="thisWeekPlanned.length === 0" class="py-8 text-center text-sm text-muted-foreground">
          No planned activities this week
        </div>
      </div>
    </div>
  </div>
</template>
