<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import AppSidebar from './AppSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { useOrganizationsStore } from '@/stores/organizations.store'
import { useActivitiesStore } from '@/stores/activities.store'

const uiStore = useUiStore()
const orgsStore = useOrganizationsStore()
const activitiesStore = useActivitiesStore()

function handleKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey || e.altKey || e.metaKey) return
  const tag = (e.target as HTMLElement).tagName.toLowerCase()
  if (['input', 'textarea', 'select'].includes(tag)) return
  if ((e.target as HTMLElement).isContentEditable) return

  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault()
    uiStore.openActivityForm(null)
  }
}

onMounted(async () => {
  uiStore.applyTheme()
  document.addEventListener('keydown', handleKeyDown)
  await Promise.all([
    orgsStore.fetchOrganizations(),
    activitiesStore.fetchActivities(),
  ])
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <TooltipProvider :delay-duration="300">
    <div class="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <AppSidebar />
      <ScrollArea class="flex-1">
        <main class="min-h-screen">
          <router-view />
        </main>
      </ScrollArea>
    </div>
    <Toaster :theme="uiStore.resolvedTheme" rich-colors position="bottom-right" />
  </TooltipProvider>
</template>
