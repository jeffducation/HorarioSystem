<script setup>
defineProps({
  activeSchedules: {
    type: Array,
    required: true
  },
  currentTimeString: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="active-monitor bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-500">
    <!-- Header del Monitor -->
    <div class="p-6 bg-gradient-to-r from-gray-900 to-blue-900 text-white flex justify-between items-center">
      <div>
        <h3 class="text-lg font-black tracking-tighter uppercase flex items-center gap-2">
          <span class="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
          Clases en Curso
        </h3>
        <p class="text-[10px] text-blue-300 font-bold uppercase tracking-widest mt-0.5">
          Monitoreo en Tiempo Real
        </p>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black tabular-nums tracking-tighter">{{ currentTimeString }}</div>
        <div class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hora Local</div>
      </div>
    </div>

    <!-- Lista de Clases Activas -->
    <div class="p-6">
      <div v-if="activeSchedules.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="item in activeSchedules" 
          :key="item.id"
          class="relative p-5 bg-white border-2 border-blue-50 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group overflow-hidden"
        >
          <!-- Indicador de Salón -->
          <div class="absolute top-0 right-0 p-3 bg-blue-600 text-white font-black text-xs rounded-bl-2xl">
            S-{{ item.room }}
          </div>

          <div class="mb-4">
            <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase tracking-widest">
              Sección {{ item.section }}
            </span>
            <h4 class="text-xl font-black text-gray-900 mt-2 leading-tight">{{ item.courseName }}</h4>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm shadow-inner">
                👨‍🏫
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase">Profesor</p>
                <p class="text-sm font-black text-gray-700">{{ item.professor }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm shadow-inner">
                ⏳
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase">Horario</p>
                <p class="text-sm font-black text-blue-600 tabular-nums">
                  {{ item.startTime }} - {{ item.endTime }}
                </p>
              </div>
            </div>
          </div>

          <!-- Barra de progreso visual (decorativa) -->
          <div class="mt-6 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-blue-600 rounded-full animate-pulse" style="width: 65%"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-else 
        class="py-16 flex flex-col items-center justify-center text-center space-y-4"
      >
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl animate-bounce">
          ☕
        </div>
        <div>
          <h4 class="text-lg font-black text-gray-800 uppercase tracking-tighter">No hay clases activas</h4>
          <p class="text-sm text-gray-400 font-medium">Es tiempo de descanso o fin de jornada.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-monitor {
  min-height: 200px;
}
</style>
