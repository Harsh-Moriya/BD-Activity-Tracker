<script setup lang="ts">
import { computed } from 'vue'
import { ACTIVITY_TYPES, ACTIVITY_STATUSES } from '@/types/activity'
import type { ActivityType, ActivityStatus, SortField } from '@/types/activity'
import { useActivitiesStore } from '@/stores/activities.store'
import { useActivityFilters } from '@/composables/useActivityFilters'
import { TYPE_PILL_ACTIVE, STATUS_PILL_ACTIVE } from '@/lib/activity-styles'
import TypeIcon from './TypeIcon.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, ArrowUp, ArrowDown } from 'lucide-vue-next'

const store = useActivitiesStore()
const {
  filters,
  activeFilterCount,
  toggleType,
  toggleStatus,
  resetFilters,
  setSortField,
  toggleSortDir,
} = useActivityFilters()

// ── Search ──────────────────────────────────────────────────────────────────
const searchQuery = computed({
  get: () => filters.value.searchQuery,
  set: (v: string) => store.setFilters({ searchQuery: v }),
})

// ── Date range ───────────────────────────────────────────────────────────────
// <input type="date"> returns YYYY-MM-DD or "" — convert empty string to null
const dateFrom = computed({
  get: () => filters.value.dateFrom ?? '',
  set: (v: string) => store.setFilters({ dateFrom: v || null }),
})
const dateTo = computed({
  get: () => filters.value.dateTo ?? '',
  set: (v: string) => store.setFilters({ dateTo: v || null }),
})

// ── Sort ─────────────────────────────────────────────────────────────────────
const sortFieldModel = computed({
  get: () => filters.value.sortField,
  set: (v: string) => setSortField(v as SortField),
})

const SORT_LABELS: Record<SortField, string> = {
  scheduled_at: 'Scheduled',
  completed_at: 'Completed',
  created_at:   'Created',
}

// ── Pill classes ─────────────────────────────────────────────────────────────
const PILL_BASE = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
const PILL_INACTIVE = 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-transparent'

function typePillClass(type: ActivityType) {
  return [PILL_BASE, filters.value.types.includes(type) ? TYPE_PILL_ACTIVE[type] : PILL_INACTIVE]
}

function statusPillClass(status: ActivityStatus) {
  return [PILL_BASE, filters.value.statuses.includes(status) ? STATUS_PILL_ACTIVE[status] : PILL_INACTIVE]
}
</script>

<template>
  <div class="space-y-2.5">
    <!-- Row 1: Search -->
    <div class="relative">
      <Search
        class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
      />
      <Input v-model="searchQuery" placeholder="Search activities…" class="pl-8" />
    </div>

    <!-- Row 2: Date range + Sort -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Date range -->
      <span class="text-xs text-muted-foreground font-medium shrink-0">Date:</span>
      <Input
        v-model="dateFrom"
        type="date"
        class="h-8 w-36 text-xs px-2"
        title="From date (filters Scheduled At)"
      />
      <span class="text-xs text-muted-foreground shrink-0">to</span>
      <Input
        v-model="dateTo"
        type="date"
        class="h-8 w-36 text-xs px-2"
        title="To date (filters Scheduled At)"
      />

      <!-- Push sort to the right -->
      <div class="flex-1 min-w-0" />

      <!-- Sort controls -->
      <span class="text-xs text-muted-foreground font-medium shrink-0">Sort:</span>
      <Select v-model="sortFieldModel">
        <SelectTrigger class="h-8 w-32 text-xs">
          <SelectValue>{{ SORT_LABELS[filters.sortField] }}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="(label, field) in SORT_LABELS"
            :key="field"
            :value="field"
          >
            {{ label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 shrink-0"
        :title="filters.sortDir === 'asc' ? 'Ascending — click for descending' : 'Descending — click for ascending'"
        @click="toggleSortDir"
      >
        <ArrowUp v-if="filters.sortDir === 'asc'" class="h-3.5 w-3.5" />
        <ArrowDown v-else class="h-3.5 w-3.5" />
      </Button>
    </div>

    <!-- Row 3: Type filters -->
    <div class="flex flex-wrap gap-1.5 items-center">
      <span class="text-xs text-muted-foreground font-medium shrink-0">Type:</span>
      <button
        v-for="type in ACTIVITY_TYPES"
        :key="type"
        :class="typePillClass(type)"
        @click="toggleType(type)"
      >
        <TypeIcon :type="type" class="h-3 w-3" />
        {{ type }}
      </button>
    </div>

    <!-- Row 4: Status filters + Clear -->
    <div class="flex flex-wrap gap-1.5 items-center">
      <span class="text-xs text-muted-foreground font-medium shrink-0">Status:</span>
      <button
        v-for="status in ACTIVITY_STATUSES"
        :key="status"
        :class="statusPillClass(status)"
        @click="toggleStatus(status)"
      >
        {{ status }}
      </button>
      <button
        v-if="activeFilterCount > 0"
        class="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        @click="resetFilters"
      >
        <X class="h-3 w-3" />
        Clear ({{ activeFilterCount }})
      </button>
    </div>
  </div>
</template>
