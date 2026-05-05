<script setup>
import { useSchedule } from '../composables/useSchedule'

const { 
  activeSchedules, 
  currentTimeString 
} = useSchedule()
</script>

<template>
  <div class="monitor-neon min-h-screen bg-black text-white p-6 md:p-10 overflow-hidden font-sans">
    
    <!-- Reloj Digital Neón (Top Right) -->
    <div class="fixed top-8 right-10 z-50 flex flex-col items-end">
      <div class="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase mb-1">System Time</div>
      <div class="text-7xl font-black tabular-nums tracking-tighter text-blue-500 [text-shadow:0_0_20px_rgba(59,130,246,0.5)]">
        {{ currentTimeString }}
      </div>
    </div>

    <!-- Título de Fondo sutil -->
    <div class="fixed -left-10 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none opacity-[0.03] select-none">
      <h1 class="text-[20vh] font-black tracking-tighter uppercase whitespace-nowrap">SYSTEMATIC LIVE MONITOR</h1>
    </div>

    <!-- Grid de Clases Activas -->
    <div v-if="activeSchedules.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 relative z-10">
      <div 
        v-for="item in activeSchedules" 
        :key="item.id"
        class="group relative bg-[#111] border-2 rounded-[3.5rem] p-12 transition-all duration-700 hover:scale-[1.02]"
        :style="{ borderColor: item.color + '44', boxShadow: `0 0 40px ${item.color}11` }"
      >
        <!-- Glow lateral basado en el color del curso -->
        <div class="absolute -left-1 top-10 bottom-10 w-1 rounded-full shadow-[0_0_20px_5px]" :style="{ backgroundColor: item.color, boxShadow: `0 0 20px ${item.color}` }"></div>

        <div class="flex justify-between items-start mb-10">
          <div class="space-y-1">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Ubicación Actual</span>
            <div class="text-4xl font-black tracking-tighter uppercase [text-shadow:0_0_10px_rgba(255,255,255,0.2)]">
              Salón <span :style="{ color: item.color }">{{ item.room }}</span>
            </div>
          </div>
          <div class="text-right">
             <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Sección</span>
             <div class="text-6xl font-black tracking-tighter text-white">{{ item.section }}</div>
          </div>
        </div>

        <h3 class="text-6xl font-black leading-[1] mb-12 tracking-tighter uppercase break-words" :style="{ color: item.color, textShadow: `0 0 30px ${item.color}44` }">
          {{ item.courseName }}
        </h3>

        <div class="space-y-10">
          <div class="flex items-center gap-6">
            <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <svg class="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Docente</p>
              <p class="text-3xl font-black tracking-tight text-gray-200">{{ item.professor }}</p>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <svg class="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Duración del Bloque</p>
              <p class="text-4xl font-black tracking-tight tabular-nums" :style="{ color: item.color }">
                {{ item.startTime }} - {{ item.endTime }}
              </p>
            </div>
          </div>
        </div>

        <!-- Barra de Progreso Real Neón -->
        <div class="mt-16">
          <div class="flex justify-between items-end mb-4">
             <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Progreso de Sesión</span>
             <span class="text-2xl font-black tabular-nums" :style="{ color: item.color }">{{ item.progress }}%</span>
          </div>
          <div class="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_15px]" 
              :style="{ width: item.progress + '%', backgroundColor: item.color, boxShadow: `0 0 20px ${item.color}` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State Neón -->
    <div v-else class="fixed inset-0 flex flex-col items-center justify-center text-center p-12 bg-black">
      <div class="w-40 h-40 rounded-[3rem] border-2 border-blue-500/30 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        <div class="w-20 h-20 bg-blue-600 rounded-2xl animate-pulse shadow-[0_0_30px_#2563eb]"></div>
      </div>
      <h3 class="text-6xl font-black text-gray-800 uppercase tracking-tighter">Standby Mode</h3>
      <p class="text-xl text-gray-600 font-bold mt-4 tracking-widest uppercase">Esperando inicio de clases...</p>
    </div>

    <!-- Glitch Decorativo inferior -->
    <div class="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
  </div>
</template>

<style scoped>
.monitor-neon {
  animation: bg-fade 2s ease-out;
}

@keyframes bg-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Tipografía de sistema */
:deep(*) {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
</style>
