<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUiStore, type Theme } from '@/stores/ui.store'

const uiStore = useUiStore()

const icons: Record<Theme, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

const labels: Record<Theme, string> = {
  system: 'System theme',
  light:  'Light theme',
  dark:   'Dark theme',
}

const order: Theme[] = ['system', 'light', 'dark']

const CurrentIcon = computed(() => icons[uiStore.theme])
const label       = computed(() => labels[uiStore.theme])

function cycle() {
  const next = order[(order.indexOf(uiStore.theme) + 1) % order.length]
  uiStore.setTheme(next)
}
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button variant="ghost" size="icon" @click="cycle" :aria-label="label">
        <component :is="CurrentIcon" class="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="right">
      <p>{{ label }}, click to cycle</p>
    </TooltipContent>
  </Tooltip>
</template>
