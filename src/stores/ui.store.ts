import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'bd-tracker-theme'

export const useUiStore = defineStore('ui', () => {
  // ── State ────────────────────────────────────────────────────────────
  const theme = ref<Theme>((localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system')
  const activityFormOpen = ref(false)
  const activityFormId = ref<number | null>(null)         // null = create, number = edit
  const activityFormFollowUpId = ref<number | null>(null) // set when creating a follow-up

  // ── Getters ──────────────────────────────────────────────────────────
  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme.value
  })

  // ── Actions ──────────────────────────────────────────────────────────
  function setTheme(t: Theme) {
    theme.value = t
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme()
  }

  function applyTheme() {
    const html = document.documentElement
    if (resolvedTheme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  function openActivityForm(id: number | null = null, followUpId: number | null = null) {
    activityFormId.value = id
    activityFormFollowUpId.value = followUpId
    activityFormOpen.value = true
  }

  function closeActivityForm() {
    activityFormOpen.value = false
    activityFormId.value = null
    activityFormFollowUpId.value = null
  }

  return {
    theme,
    activityFormOpen,
    activityFormId,
    activityFormFollowUpId,
    resolvedTheme,
    setTheme,
    applyTheme,
    openActivityForm,
    closeActivityForm,
  }
})
