<script setup lang="ts">
import { FileSpreadsheet } from 'lucide-vue-next'

defineProps<{ loading: boolean }>()
defineEmits<{ (e: 'export'): void }>()
</script>

<template>
  <button
    type="button"
    :disabled="loading"
    class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
    @click="$emit('export')"
  >
    <FileSpreadsheet class="h-4 w-4" />
    <span>{{ loading ? 'Exporting…' : 'Export to Excel' }}</span>
  </button>
</template>
