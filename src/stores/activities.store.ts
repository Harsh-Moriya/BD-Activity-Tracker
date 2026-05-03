import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Activity, ActivityFilters, ActivityStatus } from '@/types/activity'
import { emptyFilters } from '@/types/activity'
import {
  dbGetAllActivities,
  dbCreateActivity,
  dbUpdateActivity,
  dbUpdateActivityStatus,
  dbDeleteActivity,
} from '@/db/queries/activities'

export const useActivitiesStore = defineStore('activities', () => {
  // ── State ────────────────────────────────────────────────────────────
  const items = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ActivityFilters>(emptyFilters())

  // ── Getters ──────────────────────────────────────────────────────────
  const filteredActivities = computed(() => {
    const f = filters.value
    return items.value.filter((a) => {
      if (f.types.length && !f.types.includes(a.type)) return false
      if (f.statuses.length && !f.statuses.includes(a.status)) return false
      if (f.organizationId !== null && a.organization_id !== f.organizationId) return false
      if (f.dateFrom && a.scheduled_at && a.scheduled_at < f.dateFrom) return false
      if (f.dateTo && a.scheduled_at && a.scheduled_at > f.dateTo + 'T23:59:59Z') return false
      if (f.searchQuery) {
        const q = f.searchQuery.toLowerCase()
        const haystack = [a.title, a.contact_name, a.notes, a.outcome]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  })

  function activitiesForDateRange(start: string, end: string): Activity[] {
    return items.value.filter((a) => {
      const date = a.scheduled_at ?? a.completed_at ?? a.created_at
      return date >= start && date <= end + 'T23:59:59Z'
    })
  }

  // ── Actions ──────────────────────────────────────────────────────────
  async function fetchActivities() {
    loading.value = true
    error.value = null
    try {
      items.value = await dbGetAllActivities()
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  async function createActivity(
    data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<number> {
    const id = await dbCreateActivity(data)
    await fetchActivities()
    return id
  }

  async function updateActivity(
    id: number,
    data: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>
  ) {
    await dbUpdateActivity(id, data)
    await fetchActivities()
  }

  async function updateActivityStatus(id: number, status: ActivityStatus) {
    await dbUpdateActivityStatus(id, status)
    const item = items.value.find((a) => a.id === id)
    if (item) item.status = status
  }

  async function deleteActivity(id: number) {
    await dbDeleteActivity(id)
    items.value = items.value.filter((a) => a.id !== id)
  }

  function setFilters(partial: Partial<ActivityFilters>) {
    filters.value = { ...filters.value, ...partial }
  }

  function resetFilters() {
    filters.value = emptyFilters()
  }

  return {
    items,
    loading,
    error,
    filters,
    filteredActivities,
    activitiesForDateRange,
    fetchActivities,
    createActivity,
    updateActivity,
    updateActivityStatus,
    deleteActivity,
    setFilters,
    resetFilters,
  }
})
