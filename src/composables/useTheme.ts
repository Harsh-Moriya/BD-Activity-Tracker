import { watch } from 'vue'
import { useUiStore, type Theme } from '@/stores/ui.store'

export function useTheme() {
  const uiStore = useUiStore()

  // Apply theme on mount and whenever it changes
  watch(
    () => uiStore.resolvedTheme,
    () => uiStore.applyTheme(),
    { immediate: true }
  )

  // Also listen for OS preference changes when theme === 'system'
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (uiStore.theme === 'system') uiStore.applyTheme()
  })

  function cycleTheme() {
    const order: Theme[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(uiStore.theme) + 1) % order.length]
    uiStore.setTheme(next)
  }

  return { theme: uiStore.theme, resolvedTheme: uiStore.resolvedTheme, cycleTheme }
}
