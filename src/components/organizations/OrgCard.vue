<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Organization } from '@/types/organization'
import { useOrganizationsStore } from '@/stores/organizations.store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{ org: Organization }>()
defineEmits<{ edit: [] }>()

const store = useOrganizationsStore()
const deleting = ref(false)

async function confirmDelete() {
  deleting.value = true
  try {
    await store.deleteOrganization(props.org.id)
    toast.success('Organization deleted')
  } finally {
    deleting.value = false
  }
}

function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
</script>

<template>
  <div
    class="rounded-xl border bg-card text-card-foreground p-4 flex flex-col gap-2.5 hover:shadow-sm transition-shadow"
  >
    <!-- Name + actions row -->
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <h3 class="font-semibold text-sm leading-5 truncate">{{ org.name }}</h3>
        <Badge v-if="org.industry" variant="secondary" class="mt-1.5 text-xs">
          {{ org.industry }}
        </Badge>
      </div>
      <div class="flex gap-0.5 shrink-0 -mt-0.5">
        <Button variant="ghost" size="icon-sm" title="Edit" @click="$emit('edit')">
          <Pencil />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button
              variant="ghost"
              size="icon-sm"
              class="hover:text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{{ org.name }}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the organization. Activities linked to it will keep
                their data but lose the organization association.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                :disabled="deleting"
                class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                @click="confirmDelete"
              >
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    <!-- Website -->
    <a
      v-if="org.website"
      :href="org.website"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground truncate w-fit max-w-full"
      @click.stop
    >
      <ExternalLink class="h-3 w-3 shrink-0" />
      <span class="truncate">{{ displayUrl(org.website) }}</span>
    </a>

    <!-- Notes preview -->
    <p v-if="org.notes" class="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
      {{ org.notes }}
    </p>
  </div>
</template>
