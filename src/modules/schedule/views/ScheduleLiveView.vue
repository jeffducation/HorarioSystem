<script setup>
import { useSchedule } from '../composables/useSchedule'

const { 
  activeSchedules, 
  currentTimeString
} = useSchedule()
</script>

<template>
  <div class="monitor-neon min-h-screen bg-black text-white p-6 md:p-10 overflow-hidden font-sans flex items-center justify-center">
    
    <!-- Reloj (Fixed Bottom Right for Minimalist Look) -->
    <div class="fixed bottom-10 right-10 z-50 flex flex-col items-end">
      <div class="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase mb-1">System Time</div>
      <div class="text-6xl font-black tabular-nums tracking-tighter text-blue-500 [text-shadow:0_0_20px_rgba(59,130,246,0.3)]">
        {{ currentTimeString }}
      </div>
    </div>

    <!-- Título de Fondo sutil -->
    <div class="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none">
      <h1 class="text-[30vw] font-black tracking-tighter uppercase whitespace-nowrap">
        LIVE
      </h1>
    </div>

    <!-- Grid de Clases Actualles -->
    <div v-if="activeSchedules.length > 0" class="flex flex-wrap justify-center gap-12 relative z-10 w-full max-w-[1800px]">
      <div 
        v-for="item in activeSchedules" 
        :key="item.id"
        class="group relative bg-[#111] border-2 rounded-[4rem] p-16 transition-all duration-700 hover:scale-[1.02] w-full md:w-[600px]"
        :style="{ borderColor: item.color + '44', boxShadow: `0 0 60px ${item.color}11` }"
      >
        <!-- Glow lateral basado en el color del curso -->
        <div class="absolute -left-1 top-12 bottom-12 w-1.5 rounded-full" :style="{ backgroundColor: item.color, boxShadow: `0 0 30px ${item.color}` }"></div>

        <div class="flex justify-between items-start mb-12">
          <div class="space-y-1">
            <span class="text-[12px] font-black uppercase tracking-[0.3em] text-gray-500">Ubicación</span>
            <div class="text-5xl font-black tracking-tighter uppercase">
              Salón <span :style="{ color: item.color }">{{ item.room }}</span>
            </div>
          </div>
          <div class="text-right">
             <span class="text-[12px] font-black uppercase tracking-[0.3em] text-gray-500">Sección</span>
             <div class="text-5xl font-black tracking-tighter text-white">{{ item.section }}</div>
          </div>
        </div>

        <h3 class="text-8xl font-black leading-[0.9] mb-14 tracking-tighter uppercase break-words" :style="{ color: item.color, textShadow: `0 0 40px ${item.color}44` }">
          {{ item.courseName }}
        </h3>

        <div class="space-y-12">
          <div class="flex items-center gap-8">
            <div class="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
              <svg class="w-10 h-10 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
            </div>
            <div>
              <p class="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-1">Docente</p>
              <p class="text-4xl font-black tracking-tight text-gray-100">{{ item.professor }}</p>
            </div>
          </div>

          <div class="flex items-center gap-8">
            <div class="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
              <svg class="w-10 h-10 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>
            </div>
            <div>
              <p class="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-1">Horario de Bloque</p>
              <p class="text-5xl font-black tracking-tight tabular-nums" :style="{ color: item.color }">
                {{ item.startTime }} - {{ item.endTime }}
              </p>
            </div>
          </div>
        </div>

        <!-- Barra de Progreso -->
        <div class="mt-16">
          <div class="flex justify-between items-end mb-6">
             <span class="text-[12px] font-black uppercase tracking-[0.3em] text-gray-500">Progreso de Clase</span>
             <span class="text-3xl font-black tabular-nums" :style="{ color: item.color }">{{ item.progress }}%</span>
          </div>
          <div class="h-5 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-linear" 
              :style="{ width: item.progress + '%', backgroundColor: item.color, boxShadow: `0 0 30px ${item.color}` }"
            ></div>
          </div>
        </div>

        <!-- Tag de Sesión (Top Left Floating) -->
        <div v-if="item.session" class="absolute -top-6 -right-6 px-8 py-4 bg-gray-900 border-2 rounded-3xl shadow-2xl" :style="{ borderColor: item.color }">
          <span class="text-xs font-black text-gray-500 uppercase tracking-widest block">Sesión</span>
          <span class="text-3xl font-black" :style="{ color: item.color }">{{ item.session }}</span>
        </div>
      </div>
    </div>

    <!-- Modo Standby -->
    <div v-else class="text-center animate-pulse">
      <div class="w-32 h-32 bg-blue-600/20 rounded-[2.5rem] border-2 border-blue-500/30 flex items-center justify-center mx-auto mb-10">
        <div class="w-16 h-16 bg-blue-500 rounded-2xl shadow-[0_0_50px_#3b82f6]"></div>
      </div>
      <h3 class="text-7xl font-black text-gray-800 uppercase tracking-tighter">System Standby</h3>
      <p class="text-xl text-gray-500 font-bold mt-4 tracking-[0.5em] uppercase">No hay clases activas en este momento</p>
    </div>

    <!-- Glitch Decorativo inferior -->
    <div class="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
  </div>
</template>

<style scoped>
.monitor-neon {
  background-image: radial-gradient(circle at 50% 50%, #050505 0%, #000 100%);
}

/* Tipografía de sistema */
:deep(*) {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
</style>
