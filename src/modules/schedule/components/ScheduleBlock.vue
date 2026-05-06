<script setup>
const props = defineProps({
  schedule: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])

// Calcular cuántas filas debe ocupar (ej: 180 min / 60 = 3 filas)
const getSpanHeight = () => {
  const start = props.schedule.startTime
  const end = props.schedule.endTime
  const [h1, m1] = start.split(':').map(Number)
  const [h2, m2] = end.split(':').map(Number)
  const durationMinutes = (h2 * 60 + m2) - (h1 * 60 + m1)
  // Usamos una variable CSS para que el alto sea dinámico (140px normal, 70px panorámico)
  return `calc(((${durationMinutes} / 60) * var(--row-height)) - 4px)`
}

const onDragStart = (e) => {
  e.dataTransfer.setData('schedule', JSON.stringify(props.schedule))
  e.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <div 
    draggable="true"
    @dragstart="onDragStart"
    class="schedule-block group absolute top-0 left-0 w-full z-40 overflow-hidden transition-all hover:scale-[1.01] hover:z-50 active:scale-95 shadow-lg border-2 rounded-2xl cursor-grab active:cursor-grabbing"
    :style="{ 
      height: getSpanHeight(),
      backgroundColor: schedule.color + '11',
      borderColor: schedule.color + '44',
      borderLeftWidth: '6px',
      borderLeftColor: schedule.color,
      margin: '0',
    }"
  >
    <!-- Efecto de brillo sutil -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

    <div class="flex justify-between items-start mb-1 p-3 pb-0">
      <span class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg bg-white/80 border border-gray-100 text-gray-500">
        {{ schedule.startTime }} - {{ schedule.endTime }}
      </span>
      <button 
        @click.stop="emit('delete', schedule)"
        class="relative z-50 p-2 bg-white/90 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md border border-red-100 active:scale-90"
        title="Eliminar Horario"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>
    </div>

    <div class="px-4 pb-4 space-y-2">
      <h4 class="text-xs font-black text-gray-900 leading-tight uppercase tracking-tight line-clamp-2">
        {{ schedule.courseName }}
      </h4>
      
      <div class="space-y-0.5">
        <p class="text-[9px] font-bold text-gray-500 truncate flex items-center gap-1">
          <span class="w-1 h-1 rounded-full" :style="{ backgroundColor: schedule.color }"></span>
          {{ schedule.professor }}
        </p>
        <div class="flex justify-between items-center">
          <p class="text-[9px] font-black tracking-tighter" :style="{ color: schedule.color }">
            SEC. {{ schedule.section }}
          </p>
          <p v-if="schedule.module || schedule.session" class="text-[8px] font-black text-gray-400">
            M{{ schedule.module }} S{{ schedule.session }}
          </p>
        </div>
      </div>
    </div>

    <!-- Indicador de "Edit" en hover -->
    <div class="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
       <span class="text-[8px] font-black text-gray-300 uppercase tracking-widest">Click para editar</span>
    </div>
  </div>
</template>

<style scoped>
.schedule-block {
  min-height: 40px;
  cursor: pointer;
  box-sizing: border-box;
}

/* Panoramic adjustments */
:deep(.full-screen-grid) .schedule-block {
  border-radius: 0.75rem;
  border-left-width: 4px;
}

:deep(.full-screen-grid) .schedule-block h4 {
  font-size: 9px;
}

:deep(.full-screen-grid) .schedule-block p {
  font-size: 7px !important;
}

:deep(.full-screen-grid) .schedule-block .px-4 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-bottom: 0.25rem;
}

:deep(.full-screen-grid) .schedule-block .p-3 {
  padding: 0.25rem 0.5rem !important;
}
</style>
