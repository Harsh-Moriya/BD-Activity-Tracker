<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { ActivityType, ActivityStatus, Direction } from '@/types/activity'
import { ACTIVITY_TYPES, ACTIVITY_STATUSES, parseMeta } from '@/types/activity'
import { useActivitiesStore } from '@/stores/activities.store'
import { useOrganizationsStore } from '@/stores/organizations.store'
import { useUiStore } from '@/stores/ui.store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const activitiesStore = useActivitiesStore()
const orgsStore = useOrganizationsStore()
const uiStore = useUiStore()

// ── Form state (all strings except signed, to keep v-model simple) ──
interface FormState {
  type: ActivityType
  title: string
  status: ActivityStatus
  org_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  scheduled_at: string
  completed_at: string
  direction: string
  duration: string
  notes: string
  outcome: string
  parent_id: string
  location: string
  attendees: string
  deal_value: string
  currency: string
  signed: boolean
}

const form = reactive<FormState>({
  type: 'Call',
  title: '',
  status: 'Planned',
  org_id: 'none',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  scheduled_at: '',
  completed_at: '',
  direction: 'none',
  duration: '',
  notes: '',
  outcome: '',
  parent_id: 'none',
  location: '',
  attendees: '',
  deal_value: '',
  currency: 'USD',
  signed: false,
})

const titleError = ref('')
const saving = ref(false)

// ── Dialog mode ──
const isEdit = computed(() => uiStore.activityFormId !== null)
const isFollowUp = computed(
  () => uiStore.activityFormId === null && uiStore.activityFormFollowUpId !== null,
)
const dialogTitle = computed(() => {
  if (isEdit.value) return 'Edit Activity'
  if (isFollowUp.value) return 'Add Follow-up'
  return 'Log Activity'
})
const submitLabel = computed(() => {
  if (saving.value) return 'Saving…'
  if (isEdit.value) return 'Save Changes'
  if (isFollowUp.value) return 'Log Follow-up'
  return 'Log Activity'
})

// ── Conditional field visibility ──
const showDirection = computed(() => ['Call', 'Email'].includes(form.type))
const showDuration = computed(() => ['Call', 'Meeting', 'Demo'].includes(form.type))
const showLocation = computed(() => ['Meeting', 'Demo'].includes(form.type))
const showAttendees = computed(() => form.type === 'Meeting')
const showDealValue = computed(() => ['Proposal', 'Contract'].includes(form.type))
const showSigned = computed(() => form.type === 'Contract')

// ── Select options ──
const parentActivityOptions = computed(() =>
  activitiesStore.items
    .filter((a) => a.id !== uiStore.activityFormId)
    .map((a) => ({
      value: a.id.toString(),
      label: `${a.type}: ${a.title.length > 50 ? a.title.slice(0, 47) + '…' : a.title}`,
    })),
)

// ── Auto-fill completed_at when status becomes Completed ──
watch(
  () => form.status,
  (newStatus, oldStatus) => {
    if (newStatus === 'Completed' && oldStatus !== 'Completed' && !form.completed_at) {
      form.completed_at = new Date().toISOString().slice(0, 16)
    }
  },
)

// ── Initialize form when dialog opens ──
watch(
  () => uiStore.activityFormOpen,
  (open) => {
    if (!open) return
    titleError.value = ''

    const editId = uiStore.activityFormId
    const followId = uiStore.activityFormFollowUpId

    if (editId !== null) {
      const activity = activitiesStore.items.find((a) => a.id === editId)
      if (!activity) return
      const meta = parseMeta(activity.metadata) as Record<string, unknown>
      form.type = activity.type
      form.title = activity.title
      form.status = activity.status
      form.org_id = activity.organization_id?.toString() ?? 'none'
      form.contact_name = activity.contact_name ?? ''
      form.contact_email = activity.contact_email ?? ''
      form.contact_phone = activity.contact_phone ?? ''
      form.scheduled_at = activity.scheduled_at?.slice(0, 16) ?? ''
      form.completed_at = activity.completed_at?.slice(0, 16) ?? ''
      form.direction = activity.direction ?? 'none'
      form.duration = activity.duration_minutes?.toString() ?? ''
      form.notes = activity.notes ?? ''
      form.outcome = activity.outcome ?? ''
      form.parent_id = activity.parent_activity_id?.toString() ?? 'none'
      form.location = (meta.location as string) ?? ''
      form.attendees = (meta.attendees as number)?.toString() ?? ''
      form.deal_value = (meta.value as number)?.toString() ?? ''
      form.currency = (meta.currency as string) ?? 'USD'
      form.signed = (meta.signed as boolean) ?? false
    } else {
      form.type = 'Call'
      form.title = ''
      form.status = 'Planned'
      form.org_id = 'none'
      form.contact_name = ''
      form.contact_email = ''
      form.contact_phone = ''
      form.scheduled_at = ''
      form.completed_at = ''
      form.direction = 'none'
      form.duration = ''
      form.notes = ''
      form.outcome = ''
      form.parent_id = followId !== null ? followId.toString() : 'none'
      form.location = ''
      form.attendees = ''
      form.deal_value = ''
      form.currency = 'USD'
      form.signed = false
    }
  },
  // immediate: true so the form initialises when the component first mounts.
  // With v-if in ActivityList, this component is only ever mounted while the
  // dialog should be open, so the watcher fires once on mount with open=true.
  { immediate: true },
)

function buildMetadata(): string {
  const obj: Record<string, unknown> = {}
  if (form.type === 'Meeting' || form.type === 'Demo') {
    if (form.location.trim()) obj.location = form.location.trim()
    if (form.attendees) obj.attendees = parseInt(form.attendees)
  }
  if (form.type === 'Proposal' || form.type === 'Contract') {
    if (form.deal_value) {
      obj.value = parseFloat(form.deal_value)
      obj.currency = form.currency || 'USD'
    }
  }
  if (form.type === 'Contract') {
    obj.signed = form.signed
  }
  return JSON.stringify(obj)
}

function toIso(localDt: string): string | null {
  return localDt ? localDt + ':00Z' : null
}

async function handleSubmit() {
  titleError.value = ''
  if (!form.title.trim()) {
    titleError.value = 'Title is required.'
    return
  }
  saving.value = true
  try {
    const data = {
      type: form.type,
      title: form.title.trim(),
      status: form.status,
      organization_id: form.org_id !== 'none' ? parseInt(form.org_id) : null,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      scheduled_at: toIso(form.scheduled_at),
      completed_at: toIso(form.completed_at),
      duration_minutes: form.duration ? parseInt(form.duration) : null,
      direction: (form.direction !== 'none' ? form.direction : null) as Direction | null,
      notes: form.notes.trim() || null,
      outcome: form.outcome.trim() || null,
      parent_activity_id: form.parent_id !== 'none' ? parseInt(form.parent_id) : null,
      metadata: buildMetadata(),
    }
    if (isEdit.value && uiStore.activityFormId !== null) {
      await activitiesStore.updateActivity(uiStore.activityFormId, data)
      toast.success('Activity updated')
    } else {
      await activitiesStore.createActivity(data)
      toast.success('Activity logged')
    }
    uiStore.closeActivityForm()
  } catch (e) {
    console.error('ActivityFormDialog: save failed', e)
    toast.error('Failed to save activity. Please try again.')
  } finally {
    saving.value = false
  }
}

function handleClose() {
  if (!saving.value) uiStore.closeActivityForm()
}
</script>

<template>
  <Dialog :open="uiStore.activityFormOpen" @update:open="(v) => !v && handleClose()">
    <DialogContent
      class="sm:max-w-xl flex flex-col p-0 overflow-hidden max-h-[92vh] gap-0"
    >
      <DialogHeader class="px-6 pt-6 pb-4 shrink-0 pr-12">
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription class="sr-only">
          Fill in the details for this activity.
        </DialogDescription>
      </DialogHeader>

      <!-- Scrollable form area -->
      <div class="flex-1 overflow-y-auto px-6">
        <form class="space-y-4 pb-4" @submit.prevent="handleSubmit">
          <!-- Type + Status -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label>Type</Label>
              <Select v-model="form.type">
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="t in ACTIVITY_TYPES" :key="t" :value="t">{{ t }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-1.5">
              <Label>Status</Label>
              <Select v-model="form.status">
                <SelectTrigger class="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in ACTIVITY_STATUSES" :key="s" :value="s">{{ s }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Title -->
          <div class="space-y-1.5">
            <Label for="act-title">Title <span class="text-destructive">*</span></Label>
            <Input id="act-title" v-model="form.title" placeholder="Brief description…" autofocus />
            <p v-if="titleError" class="text-xs text-destructive">{{ titleError }}</p>
          </div>

          <!-- Organization -->
          <div class="space-y-1.5">
            <Label>Organization</Label>
            <Select v-model="form.org_id">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem
                  v-for="org in orgsStore.orgsForSelect"
                  :key="org.value"
                  :value="org.value.toString()"
                >
                  {{ org.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Contact Name + Email -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="act-cname">Contact Name</Label>
              <Input id="act-cname" v-model="form.contact_name" placeholder="Jane Doe" />
            </div>
            <div class="space-y-1.5">
              <Label for="act-cemail">Contact Email</Label>
              <Input id="act-cemail" v-model="form.contact_email" placeholder="jane@acme.com" />
            </div>
          </div>

          <!-- Contact Phone -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="act-cphone">Contact Phone</Label>
              <Input id="act-cphone" v-model="form.contact_phone" placeholder="+1 555 000 0000" />
            </div>
          </div>

          <!-- Scheduled At + Completed At -->
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="act-sched">Scheduled At</Label>
              <Input id="act-sched" v-model="form.scheduled_at" type="datetime-local" />
            </div>
            <div class="space-y-1.5">
              <Label for="act-comp">Completed At</Label>
              <Input id="act-comp" v-model="form.completed_at" type="datetime-local" />
            </div>
          </div>

          <!-- Direction (Call, Email) -->
          <div v-if="showDirection" class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label>Direction</Label>
              <Select v-model="form.direction">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not set</SelectItem>
                  <SelectItem value="Inbound">Inbound</SelectItem>
                  <SelectItem value="Outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Duration (Call, Meeting, Demo) -->
          <div v-if="showDuration" class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="act-dur">Duration (minutes)</Label>
              <Input id="act-dur" v-model="form.duration" type="number" min="1" placeholder="30" />
            </div>
          </div>

          <!-- Location (Meeting, Demo) -->
          <div v-if="showLocation" class="space-y-1.5">
            <Label for="act-loc">Location / Platform</Label>
            <Input id="act-loc" v-model="form.location" placeholder="Zoom, In-person, Google Meet…" />
          </div>

          <!-- Attendees (Meeting) -->
          <div v-if="showAttendees" class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="act-att">Attendee Count</Label>
              <Input id="act-att" v-model="form.attendees" type="number" min="1" placeholder="3" />
            </div>
          </div>

          <!-- Deal Value + Currency (Proposal, Contract) -->
          <div v-if="showDealValue" class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="act-val">Deal Value</Label>
              <Input id="act-val" v-model="form.deal_value" type="number" min="0" placeholder="50000" />
            </div>
            <div class="space-y-1.5">
              <Label for="act-cur">Currency</Label>
              <Input id="act-cur" v-model="form.currency" placeholder="USD" maxlength="3" />
            </div>
          </div>

          <!-- Signed (Contract) -->
          <div v-if="showSigned" class="flex items-center gap-2">
            <Checkbox id="act-signed" v-model:checked="form.signed" />
            <Label for="act-signed" class="cursor-pointer">Contract signed</Label>
          </div>

          <!-- Notes -->
          <div class="space-y-1.5">
            <Label for="act-notes">Notes</Label>
            <Textarea id="act-notes" v-model="form.notes" placeholder="Call notes, meeting summary…" :rows="3" />
          </div>

          <!-- Outcome -->
          <div class="space-y-1.5">
            <Label for="act-outcome">Outcome</Label>
            <Textarea id="act-outcome" v-model="form.outcome" placeholder="Result or next steps…" :rows="2" />
          </div>

          <!-- Follow-up of -->
          <div class="space-y-1.5">
            <Label>Follow-up of</Label>
            <Select v-model="form.parent_id">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="None (standalone)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (standalone)</SelectItem>
                <SelectItem
                  v-for="opt in parentActivityOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t shrink-0 flex justify-end gap-2">
        <Button variant="outline" :disabled="saving" @click="handleClose">Cancel</Button>
        <Button :disabled="saving" @click="handleSubmit">{{ submitLabel }}</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
