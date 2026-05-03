<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Organization } from '@/types/organization'
import { useOrganizationsStore } from '@/stores/organizations.store'
import OrgCard from './OrgCard.vue'
import OrgFormDialog from './OrgFormDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Search, Building2 } from 'lucide-vue-next'

const store = useOrganizationsStore()
const search = ref('')
const formOpen = ref(false)
const editingOrg = ref<Organization | null>(null)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.items
  return store.items.filter(
    (o) =>
      o.name.toLowerCase().includes(q) || (o.industry?.toLowerCase().includes(q) ?? false),
  )
})

function openCreate() {
  editingOrg.value = null
  formOpen.value = true
}

function openEdit(org: Organization) {
  editingOrg.value = org
  formOpen.value = true
}

onMounted(() => store.fetchOrganizations())
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 px-6 pt-6 pb-4 shrink-0">
      <div>
        <h1 class="text-2xl font-semibold">Organizations</h1>
        <p class="text-sm text-muted-foreground mt-0.5">
          {{ store.items.length }}
          {{ store.items.length === 1 ? 'organization' : 'organizations' }}
        </p>
      </div>
      <Button @click="openCreate">
        <Plus />
        Add Organization
      </Button>
    </div>

    <!-- Search -->
    <div class="px-6 pb-4 shrink-0">
      <div class="relative">
        <Search
          class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        />
        <Input
          v-model="search"
          placeholder="Search by name or industry…"
          class="pl-8"
        />
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="store.loading"
      class="flex-1 flex items-center justify-center text-muted-foreground text-sm"
    >
      Loading…
    </div>

    <!-- Empty: no orgs at all -->
    <div
      v-else-if="store.items.length === 0"
      class="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6"
    >
      <div class="rounded-full bg-muted p-4">
        <Building2 class="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p class="font-medium">No organizations yet</p>
        <p class="text-sm text-muted-foreground mt-0.5">
          Add your first organization to get started.
        </p>
      </div>
      <Button variant="outline" @click="openCreate">
        <Plus />
        Add Organization
      </Button>
    </div>

    <!-- Empty: search returned nothing -->
    <div
      v-else-if="filtered.length === 0"
      class="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6"
    >
      <p class="font-medium">No results for "{{ search }}"</p>
      <p class="text-sm text-muted-foreground">Try a different search term.</p>
    </div>

    <!-- Card grid -->
    <ScrollArea v-else class="flex-1 px-6 pb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        <OrgCard
          v-for="org in filtered"
          :key="org.id"
          :org="org"
          @edit="openEdit(org)"
        />
      </div>
    </ScrollArea>

    <!-- Form dialog (shared for create + edit) -->
    <OrgFormDialog v-model:open="formOpen" :org="editingOrg" />
  </div>
</template>
