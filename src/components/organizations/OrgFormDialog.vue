<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { Organization } from '@/types/organization'
import { useOrganizationsStore } from '@/stores/organizations.store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  open: boolean
  org?: Organization | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const store = useOrganizationsStore()

const form = ref({ name: '', industry: '', website: '', notes: '' })
const saving = ref(false)
const nameError = ref('')

const isEdit = computed(() => !!props.org)
const title = computed(() => (isEdit.value ? 'Edit Organization' : 'New Organization'))

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.value = {
        name: props.org?.name ?? '',
        industry: props.org?.industry ?? '',
        website: props.org?.website ?? '',
        notes: props.org?.notes ?? '',
      }
      nameError.value = ''
    }
  },
)

async function handleSubmit() {
  nameError.value = ''
  if (!form.value.name.trim()) {
    nameError.value = 'Name is required.'
    return
  }
  saving.value = true
  try {
    const data = {
      name: form.value.name.trim(),
      industry: form.value.industry.trim() || null,
      website: form.value.website.trim() || null,
      notes: form.value.notes.trim() || null,
    }
    if (isEdit.value && props.org) {
      await store.updateOrganization(props.org.id, data)
      toast.success('Organization updated')
    } else {
      await store.createOrganization(data)
      toast.success('Organization created')
    }
    emit('saved')
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}

function handleClose() {
  if (!saving.value) emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{
            isEdit
              ? 'Update the organization details below.'
              : 'Fill in the details for the new organization.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4 py-2" @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <Label for="org-name">Name <span class="text-destructive">*</span></Label>
          <Input
            id="org-name"
            v-model="form.name"
            placeholder="Acme Corp"
            autocomplete="off"
            autofocus
          />
          <p v-if="nameError" class="text-xs text-destructive">{{ nameError }}</p>
        </div>

        <div class="space-y-1.5">
          <Label for="org-industry">Industry</Label>
          <Input id="org-industry" v-model="form.industry" placeholder="Technology" />
        </div>

        <div class="space-y-1.5">
          <Label for="org-website">Website</Label>
          <Input id="org-website" v-model="form.website" placeholder="https://acme.com" />
        </div>

        <div class="space-y-1.5">
          <Label for="org-notes">Notes</Label>
          <Textarea
            id="org-notes"
            v-model="form.notes"
            placeholder="Any additional notes..."
            :rows="3"
          />
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" :disabled="saving" @click="handleClose">Cancel</Button>
        <Button :disabled="saving" @click="handleSubmit">
          {{ saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
