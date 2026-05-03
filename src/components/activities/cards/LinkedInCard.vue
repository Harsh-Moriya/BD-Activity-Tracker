<script setup lang="ts">
import type { Activity } from '@/types/activity'

defineProps<{ activity: Activity }>()
</script>

<template>
  <div v-if="activity.contact_name || activity.notes" class="space-y-1">
    <span v-if="activity.contact_name" class="block text-xs text-muted-foreground">
      {{ activity.contact_name }}
    </span>
    <p v-if="activity.notes" class="text-xs text-muted-foreground line-clamp-1 italic">
      "{{ activity.notes }}"
    </p>
  </div>
</template>
