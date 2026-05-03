<script setup lang="ts">
import type { Component } from 'vue'
import type { ActivityType } from '@/types/activity'
import {
  Phone,
  Users,
  Mail,
  Linkedin,
  MessageCircle,
  MonitorPlay,
  FileText,
  FileCheck2,
  Layers,
} from 'lucide-vue-next'

defineProps<{ type: ActivityType }>()

const iconMap: Record<ActivityType, Component> = {
  'Call':              Phone,
  'Meeting':           Users,
  'Email':             Mail,
  'LinkedIn Message':  Linkedin,
  'WhatsApp Message':  MessageCircle,
  'Demo':              MonitorPlay,
  'Proposal':          FileText,
  'Contract':          FileCheck2,
  'Other':             Layers,
}
</script>

<template>
  <component :is="iconMap[type]" />
</template>
