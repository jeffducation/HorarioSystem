<script setup>
import { useSchedule } from '../composables/useSchedule'

const { 
  activeSchedules, 
  rooms
} = useSchedule()

// Función para obtener la clase activa de un salón específico
const getRoomSchedule = (roomName) => {
  return activeSchedules.value.find(s => s.room === roomName)
}
</script>

<template>
  <div class="monitor-neon min-h-screen bg-black text-white p-4 md:p-6 overflow-hidden font-sans flex flex-col">
    
    <!-- Grid 3x2 de Salones (Ocupa todo el espacio) -->
    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
      <div 
        v-for="room in rooms" 
        :key="room"
        class="relative rounded-[3rem] p-8 md:p-10 border-2 transition-all duration-700 flex flex-col overflow-hidden justify-center"
        :class="getRoomSchedule(room) ? 'bg-[#111]' : 'bg-black border-dashed border-white/5'"
        :style="getRoomSchedule(room) ? { 
          borderColor: getRoomSchedule(room).color + '33', 
          boxShadow: `0 0 40px ${getRoomSchedule(room).color}08` 
        } : {}"
      >
        <!-- Header del Salón -->
        <div class="flex justify-between items-center mb-6">
          <div class="text-4xl font-black tracking-tighter uppercase">
            Salón <span :class="getRoomSchedule(room) ? '' : 'text-gray-600'" :style="getRoomSchedule(room) ? { color: getRoomSchedule(room).color } : {}">
              {{ room }}
            </span>
          </div>
          <div v-if="getRoomSchedule(room)" class="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400">
            En Curso
          </div>
          <div v-else class="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
            Libre
          </div>
        </div>

        <!-- Contenido si hay clase -->
        <template v-if="getRoomSchedule(room)">
          <div class="flex-1 flex flex-col justify-center">
            <h3 class="text-5xl font-black leading-[1.1] mb-8 tracking-tighter uppercase line-clamp-2" :style="{ color: getRoomSchedule(room).color }">
              {{ getRoomSchedule(room).courseName }}
            </h3>

            <div class="space-y-6 mb-10">
              <div class="flex items-center gap-6">
                <div class="text-[12px] font-black text-gray-600 uppercase tracking-[0.3em] w-20">Docente</div>
                <div class="text-2xl font-bold text-gray-300">{{ getRoomSchedule(room).professor }}</div>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-[12px] font-black text-gray-600 uppercase tracking-[0.3em] w-20">Horario</div>
                <div class="text-3xl font-black tabular-nums" :style="{ color: getRoomSchedule(room).color }">
                  {{ getRoomSchedule(room).startTime }} - {{ getRoomSchedule(room).endTime }}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer con Progreso y Sesión -->
          <div class="mt-auto pt-8 border-t border-white/5 flex items-end justify-between gap-8">
            <div class="flex-1">
              <div class="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                <span>Progreso de Clase</span>
                <span :style="{ color: getRoomSchedule(room).color }">{{ getRoomSchedule(room).progress }}%</span>
              </div>
              <div class="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-1000"
                  :style="{ width: getRoomSchedule(room).progress + '%', backgroundColor: getRoomSchedule(room).color, boxShadow: `0 0 20px ${getRoomSchedule(room).color}` }"
                ></div>
              </div>
            </div>
            <div class="text-right bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
              <span class="text-[10px] font-black text-gray-600 uppercase block tracking-widest">Sesión</span>
              <span class="text-3xl font-black" :style="{ color: getRoomSchedule(room).color }">S{{ getRoomSchedule(room).session }}</span>
            </div>
          </div>
        </template>

        <!-- Estado Disponible -->
        <template v-else>
          <div class="flex-1 flex flex-col items-center justify-center text-center opacity-20">
            <div class="w-20 h-20 border-2 border-gray-600 rounded-3xl flex items-center justify-center mb-6">
              <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <p class="text-sm font-black uppercase tracking-[0.5em] text-gray-400">Ambiente Disponible</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Sutil decoración inferior -->
    <div class="fixed bottom-0 left-0 right-0 h-0.5 bg-blue-500/10"></div>
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
