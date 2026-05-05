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
  // Cada fila de la matriz mide aprox 140px
  return `${(durationMinutes / 60) * 140}px`
}
</script>

<template>
  <div 
    class="schedule-block group relative p-5 rounded-3xl border-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95 z-40 overflow-hidden"
    :style="{ 
      height: getSpanHeight(),
      backgroundColor: schedule.color + '11',
      borderColor: schedule.color + '44',
      borderLeftWidth: '8px',
      borderLeftColor: schedule.color
    }"
  >
    <!-- Efecto de brillo sutil -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

    <div class="flex justify-between items-start mb-2">
      <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/50 border border-gray-100 text-gray-500">
        {{ schedule.startTime }} - {{ schedule.endTime }}
      </span>
      <button 
        @click.stop="emit('delete', schedule.id)"
        class="opacity-0 group-hover:opacity-100 p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>

    <h4 class="text-sm font-black text-gray-900 leading-tight mb-2 uppercase tracking-tight line-clamp-3">
      {{ schedule.courseName }}
    </h4>
    
    <div class="space-y-1">
      <p class="text-[10px] font-bold text-gray-500 truncate flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: schedule.color }"></span>
        {{ schedule.professor }}
      </p>
      <p class="text-[11px] font-black tracking-tighter" :style="{ color: schedule.color }">
        SECCIÓN {{ schedule.section }}
      </p>
    </div>

    <!-- Indicador de "Edit" en hover -->
    <div class="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
       <span class="text-[8px] font-black text-gray-300 uppercase tracking-widest">Click para editar</span>
    </div>
  </div>
</template>

<style scoped>
.schedule-block {
  min-height: 120px;
  cursor: pointer;
}
</style>
