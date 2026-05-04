<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { format, parseISO } from 'date-fns'
import { toast } from 'vue-sonner'
import type { Activity, ActivityType, ActivityStatus } from '@/types/activity'
import { ACTIVITY_STATUSES } from '@/types/activity'
import { useActivitiesStore } from '@/stores/activities.store'
import { useOrganizationsStore } from '@/stores/organizations.store'
import { useUiStore } from '@/stores/ui.store'
import { TYPE_ACCENT_BORDER, TYPE_ICON_BG } from '@/lib/activity-styles'
import TypeIcon from './TypeIcon.vue'
import StatusBadge from './StatusBadge.vue'
import CallCard from './cards/CallCard.vue'
import MeetingCard from './cards/MeetingCard.vue'
import EmailCard from './cards/EmailCard.vue'
import LinkedInCard from './cards/LinkedInCard.vue'
import WhatsAppCard from './cards/WhatsAppCard.vue'
import DemoCard from './cards/DemoCard.vue'
import ProposalCard from './cards/ProposalCard.vue'
import ContractCard from './cards/ContractCard.vue'
import OtherCard from './cards/OtherCard.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Building2,
  Calendar,
  CornerUpLeft,
  MoreHorizontal,
  Pencil,
  GitBranch,
  RefreshCw,
  Trash2,
  Check,
} from 'lucide-vue-next'

const props = defineProps<{ activity: Activity }>()

const activitiesStore = useActivitiesStore()
const orgsStore = useOrganizationsStore()
const uiStore = useUiStore()

const deleteOpen = ref(false)
const deleting = ref(false)

const typeCards: Record<ActivityType, Component> = {
  'Call':              CallCard,
  'Meeting':           MeetingCard,
  'Email':             EmailCard,
  'LinkedIn Message':  LinkedInCard,
  'WhatsApp Message':  WhatsAppCard,
  'Demo':              DemoCard,
  'Proposal':          ProposalCard,
  'Contract':          ContractCard,
  'Other':             OtherCard,
}

const orgName = computed(() =>
  props.activity.organization_id
    ? (orgsStore.orgById(props.activity.organization_id)?.name ?? null)
    : null,
)

const parentActivity = computed(() =>
  props.activity.parent_activity_id
    ? (activitiesStore.items.find(a => a.id === props.activity.parent_activity_id) ?? null)
    : null,
)

const displayDate = computed<string | null>(() => {
  const iso = props.activity.scheduled_at ?? props.activity.completed_at
  if (!iso) return null
  try {
    return format(parseISO(iso), 'MMM d, yyyy')
  } catch {
    return null
  }
})

function openEdit() {
  uiStore.openActivityForm(props.activity.id)
}

function openFollowUp() {
  uiStore.openActivityForm(null, props.activity.id)
}

function setStatus(status: ActivityStatus) {
  activitiesStore.updateActivityStatus(props.activity.id, status)
}

async function confirmDelete() {
  deleting.value = true
  try {
    await activitiesStore.deleteActivity(props.activity.id)
    toast.success('Activity deleted')
  } finally {
    deleting.value = false
    deleteOpen.value = false
  }
}
</script>

<template>
  <div
    :class="[
      'rounded-xl border bg-card text-card-foreground border-l-4 p-4 flex flex-col gap-2',
      'hover:shadow-sm transition-shadow',
      TYPE_ACCENT_BORDER[activity.type],
    ]"
  >
    <!-- Header: type icon + title + status + action menu -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-start gap-2.5 min-w-0 flex-1">
        <div :class="['rounded-md p-1.5 shrink-0 mt-0.5', TYPE_ICON_BG[activity.type]]">
          <TypeIcon :type="activity.type" class="h-3.5 w-3.5" />
        </div>
        <div class="min-w-0">
          <p class="text-xs text-muted-foreground font-medium leading-none mb-0.5">
            {{ activity.type }}
          </p>
          <h3 class="font-semibold text-sm leading-5 line-clamp-2">{{ activity.title }}</h3>
        </div>
      </div>

      <!-- Status + actions -->
      <div class="flex items-center gap-1 shrink-0 -mr-1">
        <StatusBadge :status="activity.status" />
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon-sm" class="opacity-60 hover:opacity-100">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="openEdit">
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem @click="openFollowUp">
              <GitBranch />
              Add Follow-up
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <RefreshCw />
                Set Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  v-for="s in ACTIVITY_STATUSES"
                  :key="s"
                  :class="{ 'font-medium': s === activity.status }"
                  @click="setStatus(s)"
                >
                  <Check
                    v-if="s === activity.status"
                    class="h-3.5 w-3.5 shrink-0"
                  />
                  <span v-else class="h-3.5 w-3.5 shrink-0 inline-block" />
                  {{ s }}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-destructive focus:bg-destructive/10 focus:text-destructive"
              @click="deleteOpen = true"
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Follow-up indicator -->
    <div
      v-if="parentActivity"
      class="flex items-center gap-1 text-xs text-muted-foreground"
    >
      <CornerUpLeft class="h-3 w-3 shrink-0" />
      <span>Follow-up of: <span class="font-medium truncate">{{ parentActivity.title }}</span></span>
    </div>

    <!-- Meta row: org + date -->
    <div
      v-if="orgName || displayDate"
      class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground"
    >
      <span v-if="orgName" class="flex items-center gap-1">
        <Building2 class="h-3 w-3 shrink-0" />
        {{ orgName }}
      </span>
      <span v-if="orgName && displayDate" class="text-muted-foreground/40">·</span>
      <span v-if="displayDate" class="flex items-center gap-1">
        <Calendar class="h-3 w-3 shrink-0" />
        {{ displayDate }}
      </span>
    </div>

    <!-- Type-specific content -->
    <component :is="typeCards[activity.type]" :activity="activity" />
  </div>

  <!-- Delete confirmation (rendered in portal, outside card layout) -->
  <AlertDialog v-model:open="deleteOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this activity?</AlertDialogTitle>
        <AlertDialogDescription>
          "{{ activity.title }}" will be permanently deleted. Any follow-up activities linked to it
          will remain but lose the parent association.
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
</template>
