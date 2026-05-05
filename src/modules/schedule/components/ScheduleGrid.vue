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
  }
})

const emit = defineEmits(['assign', 'delete', 'cellClick', 'editClick'])

// Filtrar por día y salón
const getSchedulesForCell = (time, room) => {
  return props.schedules.filter(s => 
    s.dayOfWeek === props.selectedDay &&
    s.startTime.startsWith(time.split(':')[0]) && 
    s.room === room
  )
}

const handleDrop = (event, time, room) => {
  const classId = event.dataTransfer.getData('classId')
  if (classId) {
    emit('assign', { classId, time, room })
  }
}

const onDragOver = (event) => {
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
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

    <div class="overflow-x-auto">
      <div class="min-w-[1200px]">
        <!-- Header -->
        <div class="grid grid-cols-[100px_repeat(6,1fr)] bg-gray-900 text-white sticky top-0 z-20">
          <div class="p-5 text-center border-r border-gray-800 font-black text-[9px] uppercase tracking-[0.3em] text-gray-500">
            TIME
          </div>
          <div v-for="room in rooms" :key="room" class="p-5 text-center border-r border-gray-800 font-black text-xs uppercase tracking-[0.2em]">
            SALÓN {{ room }}
          </div>
        </div>

        <!-- Body -->
        <div class="divide-y divide-gray-100">
          <div v-for="time in timeSlots" :key="time" class="grid grid-cols-[100px_repeat(6,1fr)] min-h-[140px] group">
            <div class="p-6 flex items-start justify-center border-r border-gray-100 bg-gray-50/50 group-hover:bg-blue-50/30 transition-colors">
              <span class="text-[11px] font-black text-gray-400 tabular-nums">{{ time }}</span>
            </div>

            <div 
              v-for="room in rooms" :key="room"
              class="p-3 border-r border-gray-100 last:border-r-0 transition-all relative cursor-crosshair"
              @dragover="onDragOver"
              @drop="handleDrop($event, time, room)"
              @click="emit('cellClick', { time, room, day: selectedDay })"
            >
              <div class="space-y-3 relative z-10">
                <ScheduleBlock 
                  v-for="item in getSchedulesForCell(time, room)" 
                  :key="item.id" 
                  :schedule="item"
                  @delete="emit('delete', $event)"
                  @click.stop="emit('editClick', item)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-container {
  max-height: 750px;
  overflow-y: auto;
}
</style>
