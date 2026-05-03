<script setup lang="ts">
import type { Activity } from '@/types/activity'

defineProps<{ activity: Activity }>()
</script>

<template>
  <div v-if="activity.contact_name || activity.direction || activity.notes" class="space-y-1">
    <span v-if="activity.contact_name" class="block text-xs text-muted-foreground">
      {{ activity.contact_name }}
    </span>
    <span
      v-if="activity.direction"
      class="inline-block rounded px-1.5 py-0.5 text-xs font-medium"
      :class="activity.direction === 'Inbound'
        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400'"
    >
      {{ activity.direction }}
    </span>
    <p v-if="activity.notes" class="text-xs text-muted-foreground line-clamp-1 italic">
      "{{ activity.notes }}"
    </p>
  </div>
</template>
