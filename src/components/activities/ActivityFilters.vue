<script setup lang="ts">
import { computed } from 'vue'
import { ACTIVITY_TYPES, ACTIVITY_STATUSES } from '@/types/activity'
import type { ActivityType, ActivityStatus } from '@/types/activity'
import { useActivitiesStore } from '@/stores/activities.store'
import { useActivityFilters } from '@/composables/useActivityFilters'
import { TYPE_PILL_ACTIVE, STATUS_PILL_ACTIVE } from '@/lib/activity-styles'
import TypeIcon from './TypeIcon.vue'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-vue-next'

const store = useActivitiesStore()
const { filters, activeFilterCount, toggleType, toggleStatus, resetFilters } = useActivityFilters()

const searchQuery = computed({
  get: () => filters.value.searchQuery,
  set: (v: string) => store.setFilters({ searchQuery: v }),
})

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
    <!-- Search -->
    <div class="relative">
      <Search
        class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
      />
      <Input v-model="searchQuery" placeholder="Search activities…" class="pl-8" />
    </div>

    <!-- Type filters -->
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

    <!-- Status filters -->
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
