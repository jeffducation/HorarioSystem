<script setup>
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
    <!-- Navbar Minimalista (Oculta en Monitor) -->
    <nav v-if="route.path !== '/monitor'" class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
            S
          </div>
          <span class="text-xl font-black tracking-tight">SYSTEMATIC</span>
        </div>
        
        <div class="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
          <router-link to="/admin" class="hover:text-blue-600 transition-colors" active-class="text-blue-600 border-b-2 border-blue-600 pb-1">Horarios</router-link>
          <router-link to="/monitor" class="hover:text-blue-600 transition-colors" active-class="text-blue-600 border-b-2 border-blue-600 pb-1">Monitor</router-link>
        </div>

        <div class="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
          <img src="https://ui-avatars.com/api/?name=Admin+Systematic&background=random" alt="Avatar" />
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
