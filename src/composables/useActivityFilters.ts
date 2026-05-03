import { computed } from 'vue'
import { useActivitiesStore } from '@/stores/activities.store'
import type { ActivityType, ActivityStatus } from '@/types/activity'

export function useActivityFilters() {
  const store = useActivitiesStore()

  const activeFilterCount = computed(() => {
    const f = store.filters
    let count = 0
    if (f.types.length) count++
    if (f.statuses.length) count++
    if (f.organizationId !== null) count++
    if (f.dateFrom || f.dateTo) count++
    if (f.searchQuery) count++
    return count
  })

  function toggleType(type: ActivityType) {
    const types = store.filters.types.includes(type)
      ? store.filters.types.filter((t) => t !== type)
      : [...store.filters.types, type]
    store.setFilters({ types })
  }

  function toggleStatus(status: ActivityStatus) {
    const statuses = store.filters.statuses.includes(status)
      ? store.filters.statuses.filter((s) => s !== status)
      : [...store.filters.statuses, status]
    store.setFilters({ statuses })
  }

  return {
    filters: computed(() => store.filters),
    activeFilterCount,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,
    toggleType,
    toggleStatus,
  }
}
