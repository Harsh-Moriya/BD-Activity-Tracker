<script setup lang="ts">
import { computed } from 'vue'
import type { Activity, ContractMetadata } from '@/types/activity'
import { parseMeta } from '@/types/activity'

const props = defineProps<{ activity: Activity }>()

const contractMeta = computed(() => parseMeta<ContractMetadata>(props.activity.metadata))

const dealDisplay = computed<string | null>(() => {
  const amount = contractMeta.value.value
  if (!amount) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: contractMeta.value.currency ?? 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
})
</script>

<template>
  <div v-if="dealDisplay || contractMeta.signed !== undefined" class="flex items-center gap-1.5">
    <span
      v-if="dealDisplay"
      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    >
      {{ dealDisplay }}
    </span>
    <span
      v-if="contractMeta.signed !== undefined"
      :class="[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        contractMeta.signed
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
      ]"
    >
      {{ contractMeta.signed ? 'Signed' : 'Unsigned' }}
    </span>
  </div>
</template>
