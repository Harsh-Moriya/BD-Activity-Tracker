import { createRouter, createWebHashHistory } from 'vue-router'
import ActivitiesView from '@/views/ActivitiesView.vue'
import OrganizationsView from '@/views/OrganizationsView.vue'
import ReportsView from '@/views/ReportsView.vue'

const router = createRouter({
  // Hash history works best in Tauri (no server-side routing needed)
  history: createWebHashHistory(),
  routes: [
    { path: '/',              redirect: '/activities' },
    { path: '/activities',    name: 'activities',    component: ActivitiesView },
    { path: '/organizations', name: 'organizations', component: OrganizationsView },
    { path: '/reports',       name: 'reports',       component: ReportsView },
  ],
})

export default router
