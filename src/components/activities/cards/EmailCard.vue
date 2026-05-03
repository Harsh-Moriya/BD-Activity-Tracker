<script setup lang="ts">
import type { Activity } from '@/types/activity'

defineProps<{ activity: Activity }>()
</script>

<template>
  <div v-if="activity.direction || activity.contact_email" class="flex flex-wrap items-center gap-1.5">
    <span
      v-if="activity.direction"
      :class="[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        activity.direction === 'Inbound'
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
      ]"
    >
      {{ activity.direction }}
    </span>
    <span v-if="activity.contact_email" class="text-xs text-muted-foreground truncate max-w-[220px]">
      {{ activity.contact_email }}
    </span>
  </div>
</template>
