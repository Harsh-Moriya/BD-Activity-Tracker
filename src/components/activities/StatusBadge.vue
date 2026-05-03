<script setup lang="ts">
import type { ActivityStatus } from '@/types/activity'
import { STATUS_BADGE_CLASS } from '@/lib/activity-styles'

defineProps<{ status: ActivityStatus }>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
      STATUS_BADGE_CLASS[status],
    ]"
  >
    {{ status }}
  </span>
</template>
