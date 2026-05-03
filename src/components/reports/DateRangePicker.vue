<script setup lang="ts">
import type { DatePreset } from '@/composables/useWeekDates'

const props = defineProps<{
  preset: DatePreset
  customFrom: string | null
  customTo: string | null
  dateRange: { from: string; to: string }
}>()

const emit = defineEmits<{
  (e: 'update:preset', p: DatePreset): void
  (e: 'setCustom', from: string, to: string): void
}>()

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'this-week',  label: 'This Week'  },
  { value: 'last-week',  label: 'Last Week'  },
  { value: 'this-month', label: 'This Month' },
  { value: 'custom',     label: 'Custom'     },
]

function onCustomFrom(e: Event) {
  const from = (e.target as HTMLInputElement).value
  emit('setCustom', from, props.customTo ?? props.dateRange.to)
}

function onCustomTo(e: Event) {
  const to = (e.target as HTMLInputElement).value
  emit('setCustom', props.customFrom ?? props.dateRange.from, to)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      v-for="p in PRESETS"
      :key="p.value"
      type="button"
      class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      :class="preset === p.value
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground hover:bg-muted/80'"
      @click="emit('update:preset', p.value)"
    >
      {{ p.label }}
    </button>

    <template v-if="preset === 'custom'">
      <div class="flex items-center gap-1.5 ml-2">
        <input
          type="date"
          :value="customFrom ?? dateRange.from"
          class="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          @change="onCustomFrom"
        />
        <span class="text-muted-foreground text-sm">to</span>
        <input
          type="date"
          :value="customTo ?? dateRange.to"
          class="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          @change="onCustomTo"
        />
      </div>
    </template>

    <span v-else class="ml-2 text-sm text-muted-foreground">
      {{ dateRange.from }} → {{ dateRange.to }}
    </span>
  </div>
</template>
