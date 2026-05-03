<script setup lang="ts">
import { computed } from 'vue'
import type { Activity } from '@/types/activity'
import type { Organization } from '@/types/organization'
import { ACTIVITY_TYPES } from '@/types/activity'

const props = defineProps<{
  activities: Activity[]
  orgById: (id: number) => Organization | null
}>()

const total = computed(() => props.activities.length)

const completed = computed(() => props.activities.filter(a => a.status === 'Completed').length)

const completionRate = computed(() =>
  total.value > 0 ? Math.round((completed.value / total.value) * 100) : 0
)

const byType = computed(() => {
  const map: Record<string, number> = {}
  ACTIVITY_TYPES.forEach(t => { map[t] = 0 })
  props.activities.forEach(a => { map[a.type] = (map[a.type] ?? 0) + 1 })
  return ACTIVITY_TYPES
    .map(t => ({ type: t, count: map[t] }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count)
})

const top5Orgs = computed(() => {
  const orgCounts: Record<number, number> = {}
  props.activities.forEach(a => {
    if (a.organization_id) orgCounts[a.organization_id] = (orgCounts[a.organization_id] ?? 0) + 1
  })
  return Object.entries(orgCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([idStr, count]) => ({
      name: props.orgById(Number(idStr))?.name ?? `Org #${idStr}`,
      count,
    }))
})

const TYPE_COLORS: Record<string, string> = {
  'Call':             'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Meeting':          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Email':            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'LinkedIn Message': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  'Demo':             'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  'Proposal':         'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Contract':         'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Other':            'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Total -->
    <div class="rounded-lg border border-border bg-card p-4">
      <p class="text-sm text-muted-foreground">Total Activities</p>
      <p class="mt-1 text-3xl font-bold text-foreground">{{ total }}</p>
    </div>

    <!-- Completion Rate -->
    <div class="rounded-lg border border-border bg-card p-4">
      <p class="text-sm text-muted-foreground">Completion Rate</p>
      <p class="mt-1 text-3xl font-bold text-foreground">{{ completionRate }}%</p>
      <p class="mt-1 text-xs text-muted-foreground">{{ completed }} of {{ total }} completed</p>
    </div>

    <!-- By Type -->
    <div class="rounded-lg border border-border bg-card p-4">
      <p class="text-sm font-medium text-muted-foreground mb-2">By Type</p>
      <div v-if="byType.length === 0" class="text-sm text-muted-foreground">No activities</div>
      <div v-else class="space-y-1.5">
        <div
          v-for="item in byType"
          :key="item.type"
          class="flex items-center justify-between"
        >
          <span
            class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium"
            :class="TYPE_COLORS[item.type]"
          >
            {{ item.type }}
          </span>
          <span class="text-sm font-semibold text-foreground">{{ item.count }}</span>
        </div>
      </div>
    </div>

    <!-- Top 5 Orgs -->
    <div class="rounded-lg border border-border bg-card p-4">
      <p class="text-sm font-medium text-muted-foreground mb-2">Top Organizations</p>
      <div v-if="top5Orgs.length === 0" class="text-sm text-muted-foreground">No org-linked activities</div>
      <div v-else class="space-y-1.5">
        <div
          v-for="(org, i) in top5Orgs"
          :key="org.name"
          class="flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-xs font-medium text-muted-foreground w-4 shrink-0">{{ i + 1 }}.</span>
            <span class="text-sm text-foreground truncate">{{ org.name }}</span>
          </div>
          <span class="text-sm font-semibold text-foreground shrink-0">{{ org.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
