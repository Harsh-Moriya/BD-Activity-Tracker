import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Organization, OrgSelectOption } from '@/types/organization'
import {
  dbGetAllOrganizations,
  dbCreateOrganization,
  dbUpdateOrganization,
  dbDeleteOrganization,
} from '@/db/queries/organizations'

export const useOrganizationsStore = defineStore('organizations', () => {
  // ── State ────────────────────────────────────────────────────────────
  const items = ref<Organization[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ── Getters ──────────────────────────────────────────────────────────
  const orgById = computed(() => (id: number) =>
    items.value.find((o) => o.id === id) ?? null
  )

  const orgsForSelect = computed<OrgSelectOption[]>(() =>
    items.value.map((o) => ({ value: o.id, label: o.name }))
  )

  // ── Actions ──────────────────────────────────────────────────────────
  async function fetchOrganizations() {
    loading.value = true
    error.value = null
    try {
      items.value = await dbGetAllOrganizations()
    } catch (e) {
      error.value = String(e)
    } finally {
      loading.value = false
    }
  }

  async function createOrganization(
    data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>
  ): Promise<number> {
    const id = await dbCreateOrganization(data)
    await fetchOrganizations()
    return id
  }

  async function updateOrganization(
    id: number,
    data: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>
  ) {
    await dbUpdateOrganization(id, data)
    await fetchOrganizations()
  }

  async function deleteOrganization(id: number) {
    await dbDeleteOrganization(id)
    items.value = items.value.filter((o) => o.id !== id)
  }

  return {
    items,
    loading,
    error,
    orgById,
    orgsForSelect,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  }
})
