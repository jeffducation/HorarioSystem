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
  courseName: '',
  professor: '',
  room: '',
  startTime: '',
  endTime: '',
  section: '',
  daysOfWeek: []
})

const days = [
  { id: 1, name: 'Lu' }, { id: 2, name: 'Ma' }, { id: 3, name: 'Mi' },
  { id: 4, name: 'Ju' }, { id: 5, name: 'Vi' }, { id: 6, name: 'Sa' }, { id: 0, name: 'Do' }
]

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    if (props.editItem) {
      form.value = { ...props.editItem, daysOfWeek: [props.editItem.dayOfWeek] }
    } else {
      form.value = {
        id: null,
        courseName: '',
        professor: '',
        room: props.initialData?.room || '',
        startTime: props.initialData?.time || '08:00',
        endTime: '11:00',
        section: '',
        daysOfWeek: props.initialData?.day !== undefined ? [props.initialData.day] : []
      }
    }
  }
})

const handleSave = () => {
  emit('save', { ...form.value })
  emit('close')
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
      <!-- Header -->
      <div class="p-8 bg-gray-900 text-white flex justify-between items-center">
        <div>
          <h3 class="text-2xl font-black tracking-tighter uppercase">{{ editItem ? 'Editar' : 'Programar' }} Clase</h3>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configuración de Horario Systematic</p>
        </div>
        <button @click="$emit('close')" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          ✕
        </button>
      </div>

      <!-- Formulario -->
      <div class="p-8 space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <!-- Curso -->
          <div class="col-span-2">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Curso</label>
            <select v-model="form.courseName" class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none font-bold text-gray-700 transition-all">
              <option value="" disabled>Seleccionar Curso</option>
              <option v-for="c in courses" :key="c.id" :value="c.name">{{ c.name }}</option>
            </select>
          </div>

          <!-- Profesor -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Profesor</label>
            <select v-model="form.professor" class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none font-bold text-gray-700">
              <option value="" disabled>Seleccionar Docente</option>
              <option v-for="p in professors" :key="p.id" :value="p.name">{{ p.name }}</option>
            </select>
          </div>

          <!-- Sección -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Nº Sección</label>
            <input v-model="form.section" type="text" placeholder="Ej: A-1" class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none font-bold text-gray-700" />
          </div>

          <!-- Aula -->
          <div class="col-span-2 md:col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Aula / Salón</label>
            <select v-model="form.room" class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none font-bold text-gray-700">
              <option v-for="r in rooms" :key="r" :value="r">Salón {{ r }}</option>
            </select>
          </div>

          <!-- Horario -->
          <div class="col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Inicio</label>
            <input v-model="form.startTime" type="time" class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-700" />
          </div>
          <div class="col-span-1">
            <label class="block text-[10px] font-black text-gray-400 uppercase mb-2">Fin</label>
            <input v-model="form.endTime" type="time" class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold text-gray-700" />
          </div>
        </div>

        <!-- Días Recurrentes -->
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase mb-3 text-center">Días de la Semana</label>
          <div class="flex justify-center gap-2">
            <button 
              v-for="d in days" :key="d.id"
              @click="form.daysOfWeek.includes(d.id) ? form.daysOfWeek = form.daysOfWeek.filter(x => x !== d.id) : form.daysOfWeek.push(d.id)"
              class="w-10 h-10 rounded-xl text-[10px] font-black uppercase transition-all border-2"
              :class="form.daysOfWeek.includes(d.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'"
            >
              {{ d.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="p-8 bg-gray-50 flex gap-4">
        <button @click="$emit('close')" class="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">
          Cancelar
        </button>
        <button @click="handleSave" class="flex-1 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">
          {{ editItem ? 'Actualizar' : 'Guardar Horario' }}
        </button>
      </div>
    </div>
  </div>
</template>
