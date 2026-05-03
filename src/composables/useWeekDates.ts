import { computed, ref } from 'vue'
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  subWeeks, format,
} from 'date-fns'

export type DatePreset = 'this-week' | 'last-week' | 'this-month' | 'custom'

export function useWeekDates() {
  const preset = ref<DatePreset>('last-week')
  const customFrom = ref<string | null>(null)
  const customTo = ref<string | null>(null)

  const weekStart = (d: Date) => startOfWeek(d, { weekStartsOn: 1 }) // Monday
  const weekEnd   = (d: Date) => endOfWeek(d,   { weekStartsOn: 1 })

  const dateRange = computed<{ from: string; to: string }>(() => {
    const today = new Date()
    switch (preset.value) {
      case 'this-week':
        return {
          from: format(weekStart(today), 'yyyy-MM-dd'),
          to:   format(weekEnd(today),   'yyyy-MM-dd'),
        }
      case 'last-week': {
        const lastWeek = subWeeks(today, 1)
        return {
          from: format(weekStart(lastWeek), 'yyyy-MM-dd'),
          to:   format(weekEnd(lastWeek),   'yyyy-MM-dd'),
        }
      }
      case 'this-month':
        return {
          from: format(startOfMonth(today), 'yyyy-MM-dd'),
          to:   format(endOfMonth(today),   'yyyy-MM-dd'),
        }
      case 'custom':
        return {
          from: customFrom.value ?? format(weekStart(today), 'yyyy-MM-dd'),
          to:   customTo.value   ?? format(weekEnd(today),   'yyyy-MM-dd'),
        }
    }
  })

  function setPreset(p: DatePreset) { preset.value = p }
  function setCustomRange(from: string, to: string) {
    customFrom.value = from
    customTo.value = to
    preset.value = 'custom'
  }

  return { preset, customFrom, customTo, dateRange, setPreset, setCustomRange }
}
