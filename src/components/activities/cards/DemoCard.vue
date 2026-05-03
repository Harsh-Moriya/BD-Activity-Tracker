<script setup lang="ts">
import { computed } from 'vue'
import type { Activity, MeetingMetadata } from '@/types/activity'
import { parseMeta } from '@/types/activity'

const props = defineProps<{ activity: Activity }>()
const m = computed(() => parseMeta<MeetingMetadata>(props.activity.metadata))
</script>

<template>
  <div v-if="activity.duration_minutes || m.location" class="flex flex-wrap items-center gap-1.5">
    <span
      v-if="activity.duration_minutes"
      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
    >
      {{ activity.duration_minutes }} min
    </span>
    <span
      v-if="m.location"
      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
    >
      {{ m.location }}
    </span>
  </div>
</template>
