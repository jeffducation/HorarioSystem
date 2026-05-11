import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../modules/auth/composables/useAuth'
import ScheduleAdminView from '../modules/schedule/views/ScheduleAdminView.vue'
import ScheduleLiveView from '../modules/schedule/views/ScheduleLiveView.vue'
import LoginView from '../modules/auth/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/admin'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: ScheduleAdminView,
      meta: { requiresAuth: true }
    },
    {
      path: '/monitor',
      name: 'monitor',
      component: ScheduleLiveView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const { user, checkUser } = useAuth()
  
  // Si no sabemos si hay usuario, checamos (solo una vez o si es necesario)
  if (!user.value) {
    await checkUser()
  }

  if (to.meta.requiresAuth && !user.value) {
    next('/login')
  } else if (to.path === '/login' && user.value) {
    next('/admin')
  } else {
    next()
  }
})

export default router
