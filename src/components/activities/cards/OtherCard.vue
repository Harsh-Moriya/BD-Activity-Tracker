<script setup lang="ts">
import type { Activity } from '@/types/activity'

defineProps<{ activity: Activity }>()
</script>

<template>
  <p v-if="activity.notes" class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
    {{ activity.notes }}
  </p>
</template>
