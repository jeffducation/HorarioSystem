<script setup>
import { ref, watch, computed } from 'vue'
import { useSchedule } from '../composables/useSchedule'

const { 
  activeSchedules, 
  rooms,
  simulatedTime,
  setSimulatedTime,
  resetTime
} = useSchedule()

const notifications = ref([])

// Función para lanzar notificaciones visuales
const addNotification = (title, message, type = 'info') => {
  const id = Date.now()
  notifications.value.push({ id, title, message, type })
  setTimeout(() => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }, 10000)
}

// Sincronizar con eventos de voz (opcional: podrías emitir eventos desde useSchedule)
// Por ahora, simularemos la detección aquí o usaremos un watcher
watch(activeSchedules, (newSchedules) => {
  newSchedules.forEach(s => {
    if (s.progress >= 85 && s.progress < 86) {
      addNotification('Clase por culminar', `Ambiente ${s.room}: ${s.courseName}`, 'warning')
    }
  })
}, { deep: true })

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
  <div class="monitor-neon min-h-screen bg-black text-white p-4 md:p-6 overflow-hidden font-sans flex flex-col relative">
    
    <!-- Sistema de Notificaciones Flotantes -->
    <div class="fixed top-6 right-6 z-[100] flex flex-col gap-4 max-w-md w-full">
      <TransitionGroup name="notification">
        <div 
          v-for="n in notifications" 
          :key="n.id"
          class="p-6 rounded-3xl border-2 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-500"
          :class="n.type === 'warning' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-500/10 border-blue-500/30'"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5">
              <span v-if="n.type === 'warning'">⚠️</span>
              <span v-else>📢</span>
            </div>
            <div>
              <h4 class="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-1">{{ n.title }}</h4>
              <p class="text-lg font-bold leading-tight">{{ n.message }}</p>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

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
        class="relative rounded-[3rem] p-8 md:p-10 border-2 transition-all duration-700 flex flex-col overflow-hidden justify-center group"
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
        <div class="relative z-20 flex justify-between items-center mb-6">
          <div class="text-4xl font-black tracking-tighter uppercase">
            Salón <span :class="roomSchedules[roomObj.name] ? '' : 'text-gray-600'" :style="roomSchedules[roomObj.name] ? { color: roomSchedules[roomObj.name].color } : {}">
              {{ roomObj.name }}
            </span>
          </div>
          <div v-if="roomSchedules[roomObj.name]" class="px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all"
            :class="roomSchedules[roomObj.name].isNextClass 
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
              : 'bg-white/5 border-white/10 text-gray-400'"
          >
            {{ roomSchedules[roomObj.name].isNextClass ? 'Siguiente Clase' : 'En Curso' }}
          </div>
          <div v-else class="px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
            Libre
          </div>
        </div>

        <!-- Contenido si hay clase -->
        <template v-if="roomSchedules[roomObj.name]">
          <div class="relative z-20 flex-1 flex flex-col justify-center">
            <h3 class="text-5xl font-black leading-[1.1] mb-8 tracking-tighter uppercase line-clamp-2 course-title" :style="{ '--course-color': roomSchedules[roomObj.name].color }">
              {{ roomSchedules[roomObj.name].courseName }}
            </h3>

            <div class="space-y-6 mb-10">
              <div class="flex items-center gap-6">
                <div class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] w-20">Docente</div>
                <div class="text-2xl font-bold text-white">{{ roomSchedules[roomObj.name].professor }}</div>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] w-20">Horario</div>
                <div class="text-3xl font-black tabular-nums" :style="{ color: roomSchedules[roomObj.name].color }">
                  {{ roomSchedules[roomObj.name].startTime }} - {{ roomSchedules[roomObj.name].endTime }}
                </div>
              </div>
            </div>
          </div>

          <!-- Footer con Progreso y Sesión -->
          <div class="relative z-20 mt-auto pt-8 border-t border-white/5 flex items-end justify-between gap-8">
            <div class="flex-1">
              <template v-if="!roomSchedules[roomObj.name].isNextClass">
                <div class="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
                  <span>Progreso de Clase</span>
                  <span :style="{ color: roomSchedules[roomObj.name].color }">{{ roomSchedules[roomObj.name].progress }}%</span>
                </div>
                <div class="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-1000"
                    :style="{ width: roomSchedules[roomObj.name].progress + '%', backgroundColor: roomSchedules[roomObj.name].color, boxShadow: `0 0 20px ${roomSchedules[roomObj.name].color}` }"
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
          <div class="relative z-20 flex-1 flex flex-col items-center justify-center text-center opacity-40 group-hover:opacity-60 transition-opacity">
            <div class="w-16 h-16 border border-gray-800 rounded-3xl flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Ambiente Disponible</p>
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
  background-image: radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%);
}

/* Tipografía de sistema */
:deep(*) {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease;
}
.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.notification-leave-to {
  opacity: 0;
  transform: scale(0.9);
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
</style>
