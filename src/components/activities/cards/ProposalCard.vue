<script setup lang="ts">
import { computed } from 'vue'
import type { Activity, ProposalMetadata } from '@/types/activity'
import { parseMeta } from '@/types/activity'

const props = defineProps<{ activity: Activity }>()

const proposalMeta = computed(() => parseMeta<ProposalMetadata>(props.activity.metadata))

const dealDisplay = computed<string | null>(() => {
  const amount = proposalMeta.value.value
  if (!amount) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: proposalMeta.value.currency ?? 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
})
</script>

<template>
  <div v-if="dealDisplay" class="flex items-center gap-1.5">
    <span
      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
    >
      {{ dealDisplay }}
    </span>
  </div>
</template>
