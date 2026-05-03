<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { useActivitiesStore } from '@/stores/activities.store'
import { useOrganizationsStore } from '@/stores/organizations.store'
import { useWeekDates } from '@/composables/useWeekDates'
import { useExcelExport } from '@/composables/useExcelExport'
import DateRangePicker from '@/components/reports/DateRangePicker.vue'
import WeeklyReportGrid from '@/components/reports/WeeklyReportGrid.vue'
import StatsCards from '@/components/reports/StatsCards.vue'
import ExportButton from '@/components/reports/ExportButton.vue'

const activitiesStore = useActivitiesStore()
const orgsStore = useOrganizationsStore()
const { preset, customFrom, customTo, dateRange, setPreset, setCustomRange } = useWeekDates()
const { exportToExcel } = useExcelExport()

const exporting = ref(false)

const activitiesInRange = computed(() =>
  activitiesStore.activitiesForDateRange(dateRange.value.from, dateRange.value.to)
)

async function handleExport() {
  exporting.value = true
  try {
    const saved = await exportToExcel(
      activitiesStore.items,
      activitiesInRange.value,
      (id) => orgsStore.orgById(id),
      dateRange.value
    )
    if (saved) toast.success('Report exported successfully')
  } catch (e) {
    toast.error('Export failed', { description: String(e) })
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  if (activitiesStore.items.length === 0) await activitiesStore.fetchActivities()
  if (orgsStore.items.length === 0) await orgsStore.fetchOrganizations()
})
</script>

<template>
  <div class="flex h-full flex-col gap-6 overflow-y-auto p-6">
    <!-- Header -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Reports</h1>
        <p class="mt-0.5 text-sm text-muted-foreground">Weekly meeting prep and activity stats</p>
      </div>
      <ExportButton :loading="exporting" @export="handleExport" />
    </div>

    <!-- Date range controls (drives stats + export scope) -->
    <div class="rounded-lg border border-border bg-card px-4 py-3">
      <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Report Range</p>
      <DateRangePicker
        :preset="preset"
        :custom-from="customFrom"
        :custom-to="customTo"
        :date-range="dateRange"
        @update:preset="setPreset"
        @set-custom="setCustomRange"
      />
    </div>

    <!-- Weekly grid — always last-week / this-week -->
    <section>
      <h2 class="mb-3 text-base font-semibold text-foreground">Weekly Overview</h2>
      <WeeklyReportGrid
        :activities="activitiesStore.items"
        :org-by-id="(id) => orgsStore.orgById(id)"
      />
    </section>

    <!-- Stats for selected date range -->
    <section>
      <h2 class="mb-3 text-base font-semibold text-foreground">
        Stats
        <span class="ml-2 text-sm font-normal text-muted-foreground">
          ({{ dateRange.from }} → {{ dateRange.to }})
        </span>
      </h2>
      <StatsCards
        :activities="activitiesInRange"
        :org-by-id="(id) => orgsStore.orgById(id)"
      />
    </section>
  </div>
</template>
