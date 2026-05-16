<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from './modules/auth/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#060b18] font-sans antialiased text-gray-100">
    <!-- Navbar Dark Glassmorphism (Oculta en Monitor y Login) -->
    <nav v-if="route.path !== '/monitor' && route.path !== '/login'" class="bg-[#0a1228]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
            S
          </div>
          <span class="text-xl font-black tracking-tight text-white">chedule<span class="text-blue-400">X</span></span>
        </div>
        
        <div class="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
          <router-link to="/admin" class="hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all duration-300" active-class="text-blue-400 border-b-2 border-blue-400 pb-1">Horarios</router-link>
          <router-link to="/monitor" class="hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all duration-300" active-class="text-blue-400 border-b-2 border-blue-400 pb-1">Monitor</router-link>
        </div>

        <div v-if="user" class="flex items-center gap-4">
          <button @click="handleLogout" class="text-xs font-bold text-gray-500 hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)] uppercase transition-all duration-300">
            Cerrar Sesión
          </button>
          <div class="w-10 h-10 rounded-full bg-gray-800 border-2 border-white/10 shadow-sm overflow-hidden">
            <img :src="`https://ui-avatars.com/api/?name=${user.email}&background=1e3a5f&color=60a5fa`" alt="Avatar" />
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido Principal Dinámico -->
    <RouterView />
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
