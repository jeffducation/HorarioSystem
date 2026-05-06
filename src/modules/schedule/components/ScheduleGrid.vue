<script setup>
import ScheduleBlock from './ScheduleBlock.vue'

const props = defineProps({
  timeSlots: {
    type: Array,
    required: true
  },
  rooms: {
    type: Array,
    required: true
  },
  schedules: {
    type: Array,
    default: () => []
  },
  selectedDay: {
    type: Number,
    required: true
  },
  timelinePosition: {
    type: Number,
    default: -1
  },
  viewMode: {
    type: String,
    default: 'daily' // 'daily' or 'weekly'
  },
  activeRoom: {
    type: String,
    default: ''
  },
  selectedDate: {
    type: String,
    default: ''
  }
})

const daysOfWeek = [
  { id: 1, name: 'Lu' }, { id: 2, name: 'Ma' }, { id: 3, name: 'Mi' },
  { id: 4, name: 'Ju' }, { id: 5, name: 'Vi' }, { id: 6, name: 'Sa' }, { id: 0, name: 'Do' }
]

const emit = defineEmits(['assign', 'delete', 'cellClick', 'editClick', 'move'])

// Filtrar por día y salón
const getSchedulesForCell = (time, room, dayId = null) => {
  const targetDay = dayId !== null ? dayId : props.selectedDay
  const targetRoom = dayId !== null ? props.activeRoom : room

  return props.schedules.filter(s => {
    const timeMatch = s.startTime.startsWith(time.split(':')[0])
    const roomMatch = s.room === targetRoom
    
    if (!timeMatch || !roomMatch) return false

    // Si tiene fecha específica, priorizarla
    if (s.date) {
      if (dayId !== null) {
        // Vista Semanal: Calcular qué fecha le toca a este día de la semana actual
        const refDate = new Date(props.selectedDate + 'T00:00:00')
        const dayOffset = refDate.getDay() === 0 ? 6 : refDate.getDay() - 1
        const startOfWeek = new Date(refDate)
        startOfWeek.setDate(startOfWeek.getDate() - dayOffset)
        
        const targetDayVal = dayId === 0 ? 6 : dayId - 1
        const cellDate = new Date(startOfWeek)
        cellDate.setDate(cellDate.getDate() + targetDayVal)
        const cellDateStr = `${cellDate.getFullYear()}-${(cellDate.getMonth() + 1).toString().padStart(2, '0')}-${cellDate.getDate().toString().padStart(2, '0')}`
        
        return s.date === cellDateStr
      } else {
        // Vista Diaria: Comparar directo con selectedDate
        return s.date === props.selectedDate
      }
    }

    // Fallback a día de la semana (para horarios perpetuos)
    return s.dayOfWeek === targetDay
  })
}

const onDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const handleDrop = (e, time, room, dayId = null) => {
  e.preventDefault()
  const scheduleData = e.dataTransfer.getData('schedule')
  if (!scheduleData) {
    const classId = e.dataTransfer.getData('classId')
    if (classId) {
      emit('assign', { classId, time, room })
    }
    return
  }
  
  const schedule = JSON.parse(scheduleData)
  const targetDay = dayId !== null ? dayId : props.selectedDay
  
  // Calcular duración original
  const [startH, startM] = schedule.startTime.split(':').map(Number)
  const [endH, endM] = schedule.endTime.split(':').map(Number)
  const duration = (endH * 60 + endM) - (startH * 60 + startM)
  
  // Calcular nuevo fin
  const [newH, newM] = time.split(':').map(Number)
  const newEndTotal = (newH * 60 + newM) + duration
  const newEndH = Math.floor(newEndTotal / 60).toString().padStart(2, '0')
  const newEndM = (newEndTotal % 60).toString().padStart(2, '0')
  
  // Calcular nueva fecha
  let newDateStr = schedule.date
  if (dayId !== null) {
    // Vista Semanal: Calcular fecha del día destino en la semana actual
    const refDate = new Date(props.selectedDate + 'T00:00:00')
    const dayOffset = refDate.getDay() === 0 ? 6 : refDate.getDay() - 1
    const startOfWeek = new Date(refDate)
    startOfWeek.setDate(startOfWeek.getDate() - dayOffset)
    
    const targetDayVal = dayId === 0 ? 6 : dayId - 1
    const cellDate = new Date(startOfWeek)
    cellDate.setDate(cellDate.getDate() + targetDayVal)
    newDateStr = `${cellDate.getFullYear()}-${(cellDate.getMonth() + 1).toString().padStart(2, '0')}-${cellDate.getDate().toString().padStart(2, '0')}`
  } else {
    // Vista Diaria: Mantiene la fecha seleccionada
    newDateStr = props.selectedDate
  }
  
  const updatedSchedule = {
    ...schedule,
    startTime: time,
    endTime: `${newEndH}:${newEndM}`,
    room: dayId !== null ? props.activeRoom : room,
    dayOfWeek: targetDay,
    date: newDateStr
  }
  
  emit('move', updatedSchedule)
}

const showTimeline = () => {
  const today = new Date().getDay()
  return props.selectedDay === today && props.timelinePosition >= 0
}
</script>

<template>
  <div class="schedule-container border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-xl relative">
    
    <!-- Línea de Tiempo -->
    <div 
      v-if="showTimeline()"
      class="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
      :style="{ top: `${timelinePosition}%` }"
    >
      <div class="w-full border-t-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"></div>
      <div class="absolute -left-1 w-4 h-4 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
    </div>

    <div class="grid-scroll-container">
      <div class="grid-content relative">
        <!-- Header -->
        <div class="grid grid-cols-[100px_repeat(7,1fr)] bg-gray-900 text-white sticky top-0 z-60" :class="{ 'grid-cols-[100px_repeat(6,1fr)]': viewMode === 'daily' }">
          <div class="header-cell p-5 text-center border-r border-gray-800 font-black text-[9px] uppercase tracking-[0.3em] text-gray-500">
            TIME
          </div>
          
          <!-- Columnas Dinámicas -->
          <template v-if="viewMode === 'daily'">
            <div v-for="room in rooms" :key="room" class="header-cell p-5 text-center border-r border-gray-800 font-black text-xs uppercase tracking-[0.2em]">
              SALÓN {{ room }}
            </div>
          </template>
          <template v-else>
            <div v-for="day in daysOfWeek" :key="day.id" class="header-cell p-5 text-center border-r border-gray-800 font-black text-xs uppercase tracking-[0.2em]" :class="{ 'text-blue-400 bg-blue-900/20': selectedDay === day.id }">
              {{ day.name }}
            </div>
          </template>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="time in timeSlots" :key="time" class="grid grid-cols-[100px_repeat(7,1fr)] row-container group" :class="{ 'grid-cols-[100px_repeat(6,1fr)]': viewMode === 'daily' }">
            <div class="time-column flex items-start justify-center border-r border-gray-100 bg-gray-50/50 group-hover:bg-blue-50/30 transition-colors">
              <span class="text-[11px] font-black text-gray-400 tabular-nums py-6">{{ time }}</span>
            </div>

            <!-- Celdas Dinámicas -->
            <template v-if="viewMode === 'daily'">
              <div 
                v-for="room in rooms" :key="room"
                class="relative p-1 border-r border-gray-100 last:border-r-0 transition-all cursor-crosshair"
                @dragover="onDragOver"
                @drop="handleDrop($event, time, room)"
                @click="emit('cellClick', { time, room, day: selectedDay })"
              >
                <div class="h-full w-full relative z-10">
                  <ScheduleBlock 
                    v-for="item in getSchedulesForCell(time, room)" 
                    :key="item.id" 
                    :schedule="item"
                    @delete="emit('delete', $event)"
                    @click.stop="emit('editClick', item)"
                  />
                </div>
              </div>
            </template>
            <template v-else>
              <div 
                v-for="day in daysOfWeek" :key="day.id"
                class="relative p-1 border-r border-gray-100 last:border-r-0 transition-all cursor-crosshair"
                @dragover="onDragOver"
                @drop="handleDrop($event, time, null, day.id)"
                @click="emit('cellClick', { time, room: activeRoom, day: day.id })"
              >
                <div class="h-full w-full relative z-10">
                  <ScheduleBlock 
                    v-for="item in getSchedulesForCell(time, null, day.id)" 
                    :key="item.id" 
                    :schedule="item"
                    @delete="emit('delete', $event)"
                    @click.stop="emit('editClick', item)"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-container {
  display: flex;
  flex-direction: column;
  --row-height: 140px;
}

.schedule-container.full-screen-grid {
  --row-height: 70px;
}

.grid-scroll-container {
  overflow: auto;
  max-height: 750px;
  position: relative;
}

.grid-content {
  min-width: 1200px;
}

/* Panoramic adjustments */
.full-screen-grid .grid-content {
  min-width: 900px;
}

.full-screen-grid .time-column span {
  font-size: 8px;
  padding-top: 0.5rem;
}

.full-screen-grid .header-cell {
  padding: 0.5rem !important;
  font-size: 9px !important;
}

.row-container {
  min-height: var(--row-height);
}

.full-screen-grid .row-container {
  min-height: var(--row-height);
}

/* Ensure sticky header works */
.grid-scroll-container :deep(.sticky) {
  position: sticky;
  top: 0;
  z-index: 60;
}
</style>
