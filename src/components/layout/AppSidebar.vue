<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Activity, Building2, BarChart3 } from 'lucide-vue-next'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()

const navItems = [
  { name: 'Activities',    to: '/activities',    icon: Activity },
  { name: 'Organizations', to: '/organizations', icon: Building2 },
  { name: 'Reports',       to: '/reports',       icon: BarChart3 },
]

const isActive = (path: string) =>
  computed(() => route.path.startsWith(path))
</script>

<template>
  <nav
    class="flex flex-col items-center w-14 h-full border-r border-border bg-sidebar py-3 shrink-0"
  >
    <!-- Logo / app icon -->
    <div class="mb-4 flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground font-bold text-sm select-none">
      BD
    </div>

    <Separator class="mb-3 w-8" />

    <!-- Nav links -->
    <div class="flex flex-col items-center gap-1 flex-1">
      <Tooltip v-for="item in navItems" :key="item.to">
        <TooltipTrigger as-child>
          <router-link
            :to="item.to"
            class="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            :class="[
              isActive(item.to).value
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            ]"
            :aria-label="item.name"
          >
            <component :is="item.icon" class="h-5 w-5" />
          </router-link>
        </TooltipTrigger>
        <TooltipContent side="right">{{ item.name }}</TooltipContent>
      </Tooltip>
    </div>

    <!-- Bottom: theme toggle -->
    <div class="mt-auto">
      <ThemeToggle />
    </div>
  </nav>
</template>
