<script setup lang="ts">
import { onMounted } from 'vue'
import { useActivitiesStore } from '@/stores/activities.store'
import { useOrganizationsStore } from '@/stores/organizations.store'
import { useUiStore } from '@/stores/ui.store'
import ActivityCard from './ActivityCard.vue'
import ActivityFilters from './ActivityFilters.vue'
import ActivityFormDialog from './ActivityFormDialog.vue'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClipboardList, Plus } from 'lucide-vue-next'

const store = useActivitiesStore()
const orgsStore = useOrganizationsStore()
const uiStore = useUiStore()

onMounted(async () => {
  await Promise.all([store.fetchActivities(), orgsStore.fetchOrganizations()])
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 px-6 pt-6 pb-4 shrink-0">
      <div>
        <h1 class="text-2xl font-semibold">Activities</h1>
        <p class="text-sm text-muted-foreground mt-0.5">
        <template v-if="store.filteredActivities.length === store.items.length">
          {{ store.items.length }}
          {{ store.items.length === 1 ? 'activity' : 'activities' }}
        </template>
        <template v-else>
          {{ store.filteredActivities.length }} of {{ store.items.length }} shown
        </template>
      </p>
      </div>
      <Button @click="uiStore.openActivityForm(null)">
        <Plus />
        Log Activity
      </Button>
    </div>

    <!-- Filters -->
    <div class="px-6 pb-4 shrink-0">
      <ActivityFilters />
    </div>

    <!-- Loading -->
    <div
      v-if="store.loading"
      class="flex-1 flex items-center justify-center text-sm text-muted-foreground"
    >
      Loading…
    </div>

    <!-- Empty: no activities at all -->
    <div
      v-else-if="store.items.length === 0"
      class="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6"
    >
      <div class="rounded-full bg-muted p-4">
        <ClipboardList class="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p class="font-medium">No activities yet</p>
        <p class="text-sm text-muted-foreground mt-0.5">Your logged activities will appear here.</p>
      </div>
      <Button variant="outline" @click="uiStore.openActivityForm(null)">
        <Plus />
        Log Activity
      </Button>
    </div>

    <!-- Empty: filters returned nothing -->
    <div
      v-else-if="store.filteredActivities.length === 0"
      class="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6"
    >
      <p class="font-medium">No activities match the current filters</p>
      <button
        class="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        @click="store.resetFilters"
      >
        Clear filters
      </button>
    </div>

    <!-- Activity list -->
    <ScrollArea v-else class="flex-1 px-6 pb-6">
      <div class="space-y-2 pt-1">
        <ActivityCard
          v-for="activity in store.filteredActivities"
          :key="activity.id"
          :activity="activity"
        />
      </div>
    </ScrollArea>

    <!-- Form dialog (shared for create / edit / follow-up) -->
    <!-- v-if ensures the component only mounts when open, so reka-ui's DialogRoot
         always sees open=true on first render — preventing the spurious update:open(false)
         that caused the dialog to flicker and immediately close. -->
    <ActivityFormDialog v-if="uiStore.activityFormOpen" />
  </div>
</template>
