<script setup>
defineProps({
  unassignedClasses: {
    type: Array,
    required: true
  }
})

const onDragStart = (event, classId) => {
  event.dataTransfer.setData('classId', classId)
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <aside class="w-80 flex flex-col bg-white border-l border-gray-200 shadow-2xl h-[700px] rounded-2xl overflow-hidden">
    <div class="p-6 bg-gray-900 text-white">
      <h3 class="font-black text-sm uppercase tracking-widest flex items-center gap-2">
        <span class="text-blue-400">📦</span> Clases Pendientes
      </h3>
      <p class="text-[10px] text-gray-400 font-medium mt-1">
        Arrastra una clase al salón y hora deseada.
      </p>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
      <div 
        v-for="item in unassignedClasses" 
        :key="item.id"
        draggable="true"
        @dragstart="onDragStart($event, item.id)"
        class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all group"
      >
        <div class="flex justify-between items-start mb-2">
          <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">
            Secc. {{ item.section }}
          </span>
          <span class="text-[9px] font-bold text-gray-400">
            {{ item.duration }} min
          </span>
        </div>
        
        <h4 class="font-bold text-xs text-gray-800 leading-tight mb-1">
          {{ item.courseName }}
        </h4>
        
        <div class="flex items-center gap-2 mt-2">
          <div class="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px]">
            👨‍🏫
          </div>
          <span class="text-[10px] font-medium text-gray-600">{{ item.professor }}</span>
        </div>

        <div class="mt-3 flex items-center gap-1 text-[9px] font-bold text-blue-500 uppercase">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          Listo para asignar
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-if="unassignedClasses.length === 0"
        class="h-full flex flex-col items-center justify-center text-center p-8 opacity-40"
      >
        <div class="text-4xl mb-2">✅</div>
        <p class="text-xs font-bold text-gray-500 uppercase tracking-tighter">
          Todas las clases asignadas
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Custom Scrollbar */
aside div::-webkit-scrollbar {
  width: 4px;
}
aside div::-webkit-scrollbar-track {
  background: transparent;
}
aside div::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
