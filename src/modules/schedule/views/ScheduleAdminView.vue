<script setup>
import { ref, computed } from 'vue'
import { useSchedule } from '../composables/useSchedule'
import ScheduleGrid from '../components/ScheduleGrid.vue'
import ScheduleFormModal from '../components/ScheduleFormModal.vue'

const { 
  schedules, rooms, selectedDay, professors, courses, timelinePosition,
  upsertSchedule, deleteSchedule, addProfessor, updateProfessor, deleteProfessor, 
  addCourse, updateCourse, deleteCourse 
} = useSchedule()

const daysOfWeek = [
  { id: 1, name: 'Lunes' }, { id: 2, name: 'Martes' }, { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' }, { id: 5, name: 'Viernes' }, { id: 6, name: 'Sábado' }, { id: 0, name: 'Domingo' }
]

// Modal State
const showModal = ref(false)
const editingItem = ref(null)
const initialFormData = ref(null)

const openCreateModal = (data) => {
  editingItem.value = null
  initialFormData.value = data
  showModal.value = true
}

const openEditModal = (item) => {
  editingItem.value = item
  showModal.value = true
}

// Entity Management State
const newProf = ref('')
const newCourse = ref('')
const searchProf = ref('')
const searchCourse = ref('')
const activeTab = ref('schedule')

// Estados de edición
const editingProfId = ref(null)
const editingCourseId = ref(null)
const editValue = ref('')

const startEditProf = (prof) => {
  editingProfId.value = prof.id
  editValue.value = prof.name
}

const saveEditProf = (id) => {
  if (editValue.value) {
    updateProfessor(id, editValue.value)
    editingProfId.value = null
  }
}

const startEditCourse = (course) => {
  editingCourseId.value = course.id
  editValue.value = course.name
}

const saveEditCourse = (id) => {
  if (editValue.value) {
    updateCourse(id, editValue.value)
    editingCourseId.value = null
  }
}

const confirmDeleteProf = (id) => {
  if (confirm('¿Estás seguro de eliminar a este docente?')) {
    deleteProfessor(id)
  }
}

const confirmDeleteCourse = (id) => {
  if (confirm('¿Estás seguro de eliminar este curso?')) {
    deleteCourse(id)
  }
}

// Buscadores
const filteredProfessors = computed(() => {
  return professors.value.filter(p => p.name.toLowerCase().includes(searchProf.value.toLowerCase()))
})

const filteredCourses = computed(() => {
  return courses.value.filter(c => c.name.toLowerCase().includes(searchCourse.value.toLowerCase()))
})

const handleAddProfessor = () => {
  if (newProf.value) {
    addProfessor(newProf.value)
    newProf.value = ''
  }
}

const handleAddCourse = () => {
  if (newCourse.value) {
    addCourse(newCourse.value, 120)
    newCourse.value = ''
  }
}
</script>

<template>
  <div class="p-6 max-w-[1700px] mx-auto space-y-8 animate-in fade-in duration-700">
    <!-- Navbar de Tabs -->
    <div class="flex gap-4 border-b border-gray-200 pb-1">
      <button 
        @click="activeTab = 'schedule'"
        class="px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2"
        :class="activeTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
      >
        📅 Horarios
      </button>
      <button 
        @click="activeTab = 'entities'"
        class="px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2"
        :class="activeTab === 'entities' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'"
      >
        👥 Docentes y Cursos
      </button>
    </div>

    <!-- VISTA 1: PLANIFICACIÓN -->
    <div v-if="activeTab === 'schedule'" class="space-y-8 animate-in slide-in-from-left duration-500">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tighter italic">Planificador <span class="text-blue-600">Pro</span></h1>
          <p class="text-gray-500 font-medium text-sm mt-1 tracking-tight">Selecciona un salón y hora para iniciar la programación.</p>
        </div>

        <div class="flex bg-gray-100 p-1.5 rounded-2xl overflow-x-auto shadow-inner">
          <button 
            v-for="day in daysOfWeek" :key="day.id"
            @click="selectedDay = day.id"
            class="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
            :class="selectedDay === day.id ? 'bg-white text-blue-600 shadow-lg' : 'text-gray-500'"
          >
            {{ day.name }}
          </button>
        </div>
      </header>

      <ScheduleGrid 
        :timeSlots="['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00']"
        :rooms="rooms" :schedules="schedules" :selectedDay="selectedDay" :timelinePosition="timelinePosition"
        @cellClick="openCreateModal" @editClick="openEditModal" @delete="deleteSchedule"
      />
    </div>

    <!-- VISTA 2: GESTIÓN DE ENTIDADES -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-right duration-500">
      <!-- Profesores -->
      <section class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <span class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">👨‍🏫</span>
            Docentes
          </h3>
          <span class="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase">{{ professors.length }} Total</span>
        </div>

        <div class="flex gap-2 mb-4">
          <input v-model="newProf" type="text" placeholder="Nuevo Profesor..." class="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none font-bold" @keyup.enter="handleAddProfessor" />
          <button @click="handleAddProfessor" class="px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all">+</button>
        </div>

        <div class="mb-4 relative">
          <input v-model="searchProf" type="text" placeholder="🔍 Buscar docente..." class="w-full px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
        </div>

        <div class="space-y-2 flex-1 overflow-y-auto pr-2 min-h-[400px]">
          <div v-for="p in filteredProfessors" :key="p.id" class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
            <div v-if="editingProfId === p.id" class="flex-1 flex gap-2">
              <input v-model="editValue" class="flex-1 px-3 py-1 border-2 border-blue-400 rounded-lg outline-none font-bold" @keyup.enter="saveEditProf(p.id)" />
              <button @click="saveEditProf(p.id)" class="text-blue-600 font-black text-xs uppercase">Ok</button>
            </div>
            <div v-else class="flex-1 flex justify-between items-center">
              <span class="font-bold text-gray-700">{{ p.name }}</span>
              <div class="flex gap-3 ml-4">
                <button @click="startEditProf(p)" class="text-gray-400 hover:text-blue-600 transition-colors">✏️</button>
                <button @click="confirmDeleteProf(p.id)" class="text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Cursos -->
      <section class="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <span class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">📚</span>
            Cursos
          </h3>
          <span class="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase">{{ courses.length }} Total</span>
        </div>

        <div class="flex gap-2 mb-4">
          <input v-model="newCourse" type="text" placeholder="Nuevo Curso..." class="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-600 outline-none font-bold" @keyup.enter="handleAddCourse" />
          <button @click="handleAddCourse" class="px-6 py-3 bg-emerald-600 text-white font-black rounded-xl shadow-lg hover:bg-emerald-700 transition-all">+</button>
        </div>

        <div class="mb-4 relative">
          <input v-model="searchCourse" type="text" placeholder="🔍 Buscar curso..." class="w-full px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>

        <div class="space-y-2 flex-1 overflow-y-auto pr-2 min-h-[400px]">
          <div v-for="c in filteredCourses" :key="c.id" class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all">
            <div v-if="editingCourseId === c.id" class="flex-1 flex gap-2">
              <input v-model="editValue" class="flex-1 px-3 py-1 border-2 border-emerald-400 rounded-lg outline-none font-bold" @keyup.enter="saveEditCourse(c.id)" />
              <button @click="saveEditCourse(c.id)" class="text-emerald-600 font-black text-xs uppercase">Ok</button>
            </div>
            <div v-else class="flex-1 flex justify-between items-center">
              <span class="font-bold text-gray-700">{{ c.name }}</span>
              <div class="flex gap-3 ml-4">
                <button @click="startEditCourse(c)" class="text-gray-400 hover:text-emerald-600 transition-colors">✏️</button>
                <button @click="confirmDeleteCourse(c.id)" class="text-gray-400 hover:text-red-600 transition-colors">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modal CRUD -->
    <ScheduleFormModal 
      :show="showModal" :editItem="editingItem" :initialData="initialFormData"
      :professors="professors" :courses="courses" :rooms="rooms"
      @close="showModal = false" @save="upsertSchedule"
    />
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
