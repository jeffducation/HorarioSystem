import { createRouter, createWebHistory } from 'vue-router'
import ScheduleAdminView from '../modules/schedule/views/ScheduleAdminView.vue'
import ScheduleLiveView from '../modules/schedule/views/ScheduleLiveView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/admin'
    },
    {
      path: '/admin',
      name: 'admin',
      component: ScheduleAdminView,
    },
    {
      path: '/monitor',
      name: 'monitor',
      component: ScheduleLiveView,
    },
  ],
})

export default router
