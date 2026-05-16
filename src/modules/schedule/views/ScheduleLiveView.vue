<script setup>
import { ref, computed } from 'vue'
import { useSchedule } from '../composables/useSchedule'

const { 
  activeSchedules, 
  rooms,
  simulatedTime,
  setSimulatedTime,
  resetTime
} = useSchedule()


const timeInput = ref('')
const handleTimeTravel = () => {
  if (!timeInput.value) {
    resetTime()
    return
  }
  const [h, m] = timeInput.value.split(':')
  const newDate = new Date()
  newDate.setHours(h, m, 0)
  setSimulatedTime(newDate)
}

// Mapeo eficiente de salones a sus horarios activos
const roomSchedules = computed(() => {
  const map = {}
  rooms.value.forEach(roomObj => {
    map[roomObj.name] = activeSchedules.value.find(s => s.roomId === roomObj.id) || null
  })
  return map
})
</script>

<template>
  <div class="monitor-container min-h-screen text-white p-4 md:p-6 overflow-hidden font-sans flex flex-col relative">
    

    <!-- Controles de Tiempo (Solo Administradores / Debug) -->
    <div class="fixed bottom-6 right-6 z-[100] group">
      <div class="flex items-center gap-2 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
        <input type="time" v-model="timeInput" @change="handleTimeTravel" class="bg-transparent border-none text-xs font-black uppercase text-blue-500 outline-none" />
        <button v-if="simulatedTime" @click="resetTime(); timeInput = ''" class="text-[10px] font-black text-red-500 uppercase px-2">Reset</button>
      </div>
      <div class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center ml-auto mt-2 border border-white/10 cursor-help">
        <span class="text-[10px] font-black text-gray-600 italic">PRO</span>
      </div>
    </div>
    
    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
      <div 
        v-for="roomObj in rooms" 
        :key="roomObj.id"
        class="relative rounded-[3rem] p-8 md:p-10 border-3 transition-all duration-700 flex flex-col overflow-hidden justify-center group"
        :class="roomSchedules[roomObj.name] ? 'bg-[#0a101f] active-card' : 'bg-[#0f172a]/20 border-dashed border-white/5'"
        :style="roomSchedules[roomObj.name] ? { 
          borderColor: roomSchedules[roomObj.name].color + '44', 
          '--glow-color': roomSchedules[roomObj.name].color
        } : {}"
      >
        <!-- Soft Border Trace (Solo si hay clase) -->
        <div v-if="roomSchedules[roomObj.name]" class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="absolute -inset-[50%] animate-[spin_10s_linear_infinite] opacity-40" 
            :style="{ background: `conic-gradient(from 0deg, transparent 0deg, transparent 340deg, ${roomSchedules[roomObj.name].color} 360deg)` }">
          </div>
          <div class="absolute inset-[1.5px] bg-[#0a101f] rounded-[3rem]"></div>
        </div>
        <!-- Header del Salón -->
        <div class="relative z-20 flex justify-between items-center mb-8">
          <div 
            class="flex items-center gap-6 bg-white/5 px-6 py-4 rounded-[2.5rem] border transition-all duration-700"
            :class="roomSchedules[roomObj.name] ? 'border-white/20' : 'border-white/5'"
            :style="roomSchedules[roomObj.name] ? { 
              boxShadow: `0 0 25px ${roomSchedules[roomObj.name].color}15`,
              borderColor: `${roomSchedules[roomObj.name].color}33`
            } : {}"
          >
            <div class="flex items-center justify-center">
              <svg class="w-8 h-8 transition-colors duration-700" :class="roomSchedules[roomObj.name] ? 'text-white' : 'text-gray-700'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div 
              class="text-6xl font-black tracking-tighter uppercase leading-none room-name-effect transition-all duration-700"
              :class="roomSchedules[roomObj.name] ? 'text-white' : 'text-gray-700'"
              :style="roomSchedules[roomObj.name] ? { 
                textShadow: `0 0 15px ${roomSchedules[roomObj.name].color}44`,
                color: '#fff'
              } : {}"
            >
              {{ roomObj.name }}
            </div>
          </div>
          
        </div>

        <!-- Contenido si hay clase -->
        <template v-if="roomSchedules[roomObj.name]">
          <div class="relative z-20 flex-1 flex flex-col justify-center">
            <h3 class="text-5xl font-bold leading-[1.1] mb-8 tracking-tight uppercase line-clamp-2 course-title font-outfit" :style="{ '--course-color': roomSchedules[roomObj.name].color }">
              {{ roomSchedules[roomObj.name].courseName }}
            </h3>

            <div class="space-y-6 mb-10">
              <div class="flex items-center gap-6">
                <div class="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] w-20">Docente</div>
                <div class="text-2xl font-bold text-white">{{ roomSchedules[roomObj.name].professor }}</div>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] w-20">Horario</div>
                <div 
                  class="text-3xl font-black tabular-nums time-glow" 
                  :style="{ color: roomSchedules[roomObj.name].color, '--glow-time': roomSchedules[roomObj.name].color }"
                >
                  {{ roomSchedules[roomObj.name].startTime }} — {{ roomSchedules[roomObj.name].endTime }}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer con Progreso y Sesión -->
          <div class="relative z-20 mt-auto pt-8 border-t border-white/5 flex items-end justify-between gap-8">
            <div class="flex-1">
              <template v-if="!roomSchedules[roomObj.name].isNextClass">
                <div class="flex justify-between text-[12px] font-black uppercase tracking-widest text-gray-500 mb-3">
                  <span>Progreso de Clase</span>
                  <span :style="{ color: roomSchedules[roomObj.name].color }">{{ roomSchedules[roomObj.name].progress }}%</span>
                </div>
                <div class="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    class="progress-bar-animated h-full rounded-full transition-[width] duration-1000"
                    :style="{ 
                      width: roomSchedules[roomObj.name].progress + '%', 
                      '--bar-color': roomSchedules[roomObj.name].color,
                      boxShadow: `0 0 20px ${roomSchedules[roomObj.name].color}` 
                    }"
                  ></div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center gap-4 text-blue-500">
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  <span class="text-[11px] font-black uppercase tracking-[0.2em]">Preparando ambiente...</span>
                </div>
              </template>
            </div>
            <div class="text-right bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
              <span class="text-[9px] font-black text-gray-500 uppercase block tracking-widest mb-1">Sesión</span>
              <span class="text-3xl font-black" :style="{ color: roomSchedules[roomObj.name].color }">{{ roomSchedules[roomObj.name].session }}</span>
            </div>
          </div>
        </template>

        <!-- Estado Disponible -->
        <template v-else>
          <div class="relative z-20 flex-1 flex flex-col items-center justify-center text-center opacity-10">
            <!-- Espacio vacío minimalista para ambientes libres -->
          </div>
        </template>
      </div>
    </div>

    <!-- Sutil decoración inferior -->
    <div class="fixed bottom-0 left-0 right-0 h-0.5 bg-blue-500/10"></div>
  </div>
  
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300..900&display=swap');

.font-outfit {
  font-family: 'Outfit', sans-serif;
}

.monitor-container {
  background: linear-gradient(-45deg, #020617, #0a1228, #020617, #0f172a);
  background-size: 400% 400%;
  animation: backgroundMove 15s ease infinite;
}

.room-name-effect {
  background: linear-gradient(to bottom, #fff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

@keyframes backgroundMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Tipografía de sistema */
:deep(*) {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}



.active-card {
  box-shadow: 0 0 30px -10px rgba(0,0,0,0.5);
}

.course-title {
  background: linear-gradient(to right, var(--course-color) 20%, #fff 50%, var(--course-color) 80%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
  filter: drop-shadow(0 0 5px rgba(255,255,255,0.1));
}

@keyframes shimmer {
  to { background-position: 200% center; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Subtle neon glow pulse for time display */
.time-glow {
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    text-shadow: 0 0 4px color-mix(in srgb, var(--glow-time) 30%, transparent);
    filter: brightness(1);
  }
  50% {
    text-shadow: 
      0 0 8px color-mix(in srgb, var(--glow-time) 50%, transparent),
      0 0 20px color-mix(in srgb, var(--glow-time) 20%, transparent);
    filter: brightness(1.15);
  }
}

/* Animated gradient progress bar */
.progress-bar-animated {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--bar-color) 60%, black) 0%,
    var(--bar-color) 30%,
    color-mix(in srgb, var(--bar-color) 70%, white) 50%,
    var(--bar-color) 70%,
    color-mix(in srgb, var(--bar-color) 60%, black) 100%
  );
  background-size: 200% 100%;
  animation: gradient-sweep 2s ease-in-out infinite;
}

@keyframes gradient-sweep {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
</style>
