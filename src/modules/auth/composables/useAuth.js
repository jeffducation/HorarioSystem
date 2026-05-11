import { ref, readonly } from 'vue'
import { authService } from '../services/authService'

const user = ref(null)
const loading = ref(true)

export function useAuth() {
  
  const login = async (email, password) => {
    try {
      loading.value = true
      await authService.login(email, password)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      await authService.logout()
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const checkUser = async () => {
    try {
      const session = await authService.getSession()
      user.value = session?.user ?? null
    } catch (error) {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  // Inicializar escucha de cambios
  authService.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null
    loading.value = false
  })

  return {
    user: readonly(user),
    loading: readonly(loading),
    login,
    logout,
    checkUser
  }
}
