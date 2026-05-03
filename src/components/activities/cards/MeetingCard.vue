<script setup lang="ts">
import { computed } from 'vue'
import type { Activity, MeetingMetadata } from '@/types/activity'
import { parseMeta } from '@/types/activity'

const props = defineProps<{ activity: Activity }>()
const m = computed(() => parseMeta<MeetingMetadata>(props.activity.metadata))
</script>

<template>
  <div
    v-if="activity.duration_minutes || m.location || m.attendees || activity.contact_name"
    class="flex flex-wrap items-center gap-1.5"
  >
    <span
      v-if="activity.duration_minutes"
      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    >
      {{ activity.duration_minutes }} min
    </span>
    <span
      v-if="m.location"
      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
    >
      {{ m.location }}
    </span>
    <span v-if="m.attendees" class="text-xs text-muted-foreground">
      {{ m.attendees }} attendees
    </span>
    <span v-if="activity.contact_name" class="text-xs text-muted-foreground">
      {{ activity.contact_name }}
    </span>
  </div>
</template>
