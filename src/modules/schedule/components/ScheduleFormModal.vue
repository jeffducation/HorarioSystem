<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  editItem: Object,
  professors: Array,
  courses: Array,
  rooms: Array,
  initialData: Object // { time, room, day }
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  id: null,
  courseId: '',
  professorId: '',
  roomId: '',
  startTime: '',
  endTime: '',
  section: '',
  module: '',
  session: '',
  daysOfWeek: [],
  weeksToRepeat: 1
})

const errors = ref({
  course: false,
  professor: false,
  room: false
})

const validate = () => {
  errors.value.course = !form.value.courseId
  errors.value.professor = !form.value.professorId
  errors.value.room = !form.value.roomId
  
  return !errors.value.course && !errors.value.professor && !errors.value.room
}

const days = [
  { id: 1, name: 'Lu' }, { id: 2, name: 'Ma' }, { id: 3, name: 'Mi' },
  { id: 4, name: 'Ju' }, { id: 5, name: 'Vi' }, { id: 6, name: 'Sa' }, { id: 0, name: 'Do' }
]

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    // Reset errors
    errors.value = { course: false, professor: false, room: false }
    
    if (props.editItem) {
      // Al editar, mapeamos los IDs explícitamente para asegurar que el select los reconozca
      form.value = { 
        ...props.editItem, 
        courseId: props.editItem.courseId || '',
        professorId: props.editItem.professorId || '',
        roomId: props.editItem.roomId || '',
        daysOfWeek: props.editItem.dayOfWeek !== undefined ? [props.editItem.dayOfWeek] : []
      }
    } else {
      form.value = {
        id: null,
        courseId: '',
        professorId: '',
        roomId: props.initialData?.roomId || '',
        startTime: props.initialData?.time || '08:00',
        endTime: '11:00',
        section: '',
        module: '',
        session: '',
        daysOfWeek: props.initialData?.day !== undefined ? [props.initialData.day] : [],
        weeksToRepeat: 1
      }
    }
  }
})

const handleSave = () => {
  if (validate()) {
    emit('save', { ...form.value })
    emit('close')
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-[#0a1228] w-[95%] md:w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in duration-300">
      <!-- Header -->
      <div class="p-6 md:p-8 bg-gray-900 text-white flex justify-between items-center">
        <div>
          <h3 class="text-xl md:text-2xl font-black tracking-tighter uppercase">{{ editItem ? 'Editar' : 'Programar' }} Clase</h3>
          <p class="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configuración de Horario Systematic</p>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          ✕
        </button>
      </div>

      <!-- Formulario -->
      <div class="p-5 md:p-8 space-y-4 md:space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div class="grid grid-cols-2 gap-3 md:gap-4">
          <!-- Curso -->
          <div class="col-span-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Curso</label>
            <select 
              v-model="form.courseId" 
              :class="errors.course ? 'border-red-500/50' : 'border-white/10'"
              class="w-full px-4 py-3 bg-white/5 border-2 rounded-xl focus:border-blue-500 outline-none font-bold text-white transition-all"
            >
              <option value="" disabled>Seleccionar Curso</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <p v-if="errors.course" class="text-red-500 text-[9px] font-bold mt-1 uppercase">El curso es obligatorio</p>
          </div>

          <!-- Profesor -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Profesor</label>
            <select 
              v-model="form.professorId" 
              :class="errors.professor ? 'border-red-500/50' : 'border-white/10'"
              class="w-full px-4 py-3 bg-white/5 border-2 rounded-xl focus:border-blue-500 outline-none font-bold text-white"
            >
              <option value="" disabled>Seleccionar Docente</option>
              <option v-for="p in professors" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
            <p v-if="errors.professor" class="text-red-500 text-[9px] font-bold mt-1 uppercase">El profesor es obligatorio</p>
          </div>

          <!-- Sección -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Nº Sección</label>
            <input v-model="form.section" type="text" placeholder="Ej: A-1" class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:border-blue-500 outline-none font-bold text-white placeholder-gray-600" />
          </div>

          <!-- Módulo -->
          <div class="col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Módulo</label>
            <input v-model="form.module" type="number" placeholder="Ej: 1" class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:border-blue-500 outline-none font-bold text-white placeholder-gray-600" />
          </div>

          <!-- Sesión -->
          <div class="col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Sesión</label>
            <input v-model="form.session" type="text" placeholder="Ej: 09" class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:border-blue-500 outline-none font-bold text-white placeholder-gray-600" />
          </div>

          <!-- Aula -->
          <div class="col-span-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Aula / Salón</label>
            <select 
              v-model="form.roomId" 
              :class="errors.room ? 'border-red-500/50' : 'border-white/10'"
              class="w-full px-4 py-3 bg-white/5 border-2 rounded-xl focus:border-blue-500 outline-none font-bold text-white"
            >
              <option value="" disabled>Seleccionar Aula</option>
              <option v-for="r in rooms" :key="r.id" :value="r.id">Salón {{ r.name }}</option>
            </select>
            <p v-if="errors.room" class="text-red-500 text-[9px] font-bold mt-1 uppercase">El aula es obligatoria</p>
          </div>

          <!-- Horario -->
          <div class="col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Inicio</label>
            <input v-model="form.startTime" type="time" class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl font-bold text-white" />
          </div>
          <div class="col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Fin</label>
            <input v-model="form.endTime" type="time" class="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl font-bold text-white" />
          </div>

          <!-- Repetir por Semanas -->
          <div v-if="!editItem" class="col-span-2 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <label class="block text-[10px] font-black text-blue-400 uppercase mb-2">Repetir por semanas</label>
            <div class="flex items-center gap-4">
              <input v-model="form.weeksToRepeat" type="number" min="1" max="12" class="w-24 px-4 py-3 bg-white/5 border-2 border-blue-500/30 rounded-xl focus:border-blue-500 outline-none font-bold text-white" />
              <div class="flex-1">
                <p class="text-[9px] font-bold text-blue-300/70 leading-tight">
                  Se generarán automáticamente las sesiones correlativas para las siguientes semanas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Días Recurrentes -->
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase mb-3 text-center">Días de la Semana</label>
          <div class="flex justify-center gap-2">
            <button 
              v-for="d in days" :key="d.id"
              @click="form.daysOfWeek.includes(d.id) ? form.daysOfWeek = form.daysOfWeek.filter(x => x !== d.id) : form.daysOfWeek.push(d.id)"
              type="button"
              class="w-10 h-10 rounded-xl text-[10px] font-black uppercase transition-all border-2"
              :class="form.daysOfWeek.includes(d.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-500 hover:border-blue-500/30'"
            >
              {{ d.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="p-5 md:p-8 bg-white/[0.03] border-t border-white/5 flex flex-col sm:flex-row gap-3 md:gap-4">
        <button @click="$emit('close')" type="button" class="order-2 sm:order-1 flex-1 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors">
          Cancelar
        </button>
        <button @click="handleSave" type="button" class="order-1 sm:order-2 flex-1 py-3 md:py-4 bg-blue-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] transition-all">
          {{ editItem ? 'Actualizar' : 'Guardar Horario' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
</style>
