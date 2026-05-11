<script setup>
import { ref, computed, watch } from 'vue'
import { useSchedule } from '../composables/useSchedule'
import ScheduleGrid from '../components/ScheduleGrid.vue'
import ScheduleFormModal from '../components/ScheduleFormModal.vue'

const { 
  schedules, rooms, roomsFull, selectedDay, professors, courses, timelinePosition,
  upsertSchedule, deleteSchedule, deleteSchedulesBySection, 
  addProfessor, updateProfessor, deleteProfessor, 
  addCourse, updateCourse, deleteCourse,
  addRoom, updateRoom, deleteRoom 
} = useSchedule()

const daysOfWeek = [
  { id: 1, name: 'Lunes' }, { id: 2, name: 'Martes' }, { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' }, { id: 5, name: 'Viernes' }, { id: 6, name: 'Sábado' }, { id: 0, name: 'Domingo' }
]

const getTodayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
}

const selectedDate = ref(getTodayStr())

// Sincronizar selectedDay con la fecha seleccionada
watch(selectedDate, (newDate) => {
  if (!newDate) return
  const date = new Date(newDate + 'T00:00:00')
  selectedDay.value = date.getDay()
}, { immediate: true })

const selectDayAndDate = (dayId) => {
  const current = new Date(selectedDate.value + 'T00:00:00')
  const currentDay = current.getDay() === 0 ? 6 : current.getDay() - 1
  const targetDay = dayId === 0 ? 6 : dayId - 1
  const diff = targetDay - currentDay
  current.setDate(current.getDate() + diff)
  selectedDate.value = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`
}

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
const newRoom = ref('')
const newRoomCapacity = ref(0)
const searchProf = ref('')
const searchCourse = ref('')
const searchRoom = ref('')
const activeTab = ref('schedule')

// Estados de edición
const editingProfId = ref(null)
const editingCourseId = ref(null)
const editingRoomId = ref(null)
const editValue = ref('')
const editCapacity = ref(0)
const isFullScreen = ref(false)
const viewMode = ref('daily') // 'daily' or 'weekly'
const activeRoom = ref('201')

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
}

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

// Generic Confirmation State
const showGenericConfirm = ref(false)
const genericConfirmTitle = ref('')
const genericConfirmMessage = ref('')
const genericConfirmAction = ref(null)

const confirmAction = (title, message, action) => {
  genericConfirmTitle.value = title
  genericConfirmMessage.value = message
  genericConfirmAction.value = action
  showGenericConfirm.value = true
}

const executeGenericAction = async () => {
  if (genericConfirmAction.value) {
    await genericConfirmAction.value()
  }
  showGenericConfirm.value = false
}

const confirmDeleteProf = (id) => {
  confirmAction(
    'Eliminar Docente',
    '¿Estás seguro de que deseas eliminar permanentemente a este docente?',
    () => deleteProfessor(id)
  )
}

const confirmDeleteCourse = (id) => {
  confirmAction(
    'Eliminar Curso',
    '¿Estás seguro de que deseas eliminar este curso del sistema?',
    () => deleteCourse(id)
  )
}

const confirmDeleteRoom = (id) => {
  confirmAction(
    'Eliminar Salón',
    '¿Estás seguro de que deseas eliminar este ambiente? Los horarios asociados podrían verse afectados.',
    () => deleteRoom(id)
  )
}

// Buscadores
const filteredProfessors = computed(() => {
  return professors.value.filter(p => p.name.toLowerCase().includes(searchProf.value.toLowerCase()))
})

const filteredCourses = computed(() => {
  return courses.value.filter(c => c.name.toLowerCase().includes(searchCourse.value.toLowerCase()))
})

const filteredRooms = computed(() => {
  return roomsFull.value.filter(r => r.name.toLowerCase().includes(searchRoom.value.toLowerCase()))
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

const handleAddRoom = () => {
  if (newRoom.value) {
    addRoom(newRoom.value, newRoomCapacity.value)
    newRoom.value = ''
    newRoomCapacity.value = 0
  }
}

const startEditRoom = (room) => {
  editingRoomId.value = room.id
  editValue.value = room.name
  editCapacity.value = room.capacity || 0
}

const saveEditRoom = (id) => {
  if (editValue.value) {
    updateRoom(id, editValue.value, editCapacity.value)
    editingRoomId.value = null
  }
}

// Modern Delete Confirmation State
const showDeleteConfirm = ref(false)
const itemToDelete = ref(null)

const confirmDeleteSchedule = (item) => {
  itemToDelete.value = item
  showDeleteConfirm.value = true
}

const executeDelete = async (mode) => {
  if (!itemToDelete.value) return
  
  if (mode === 'single') {
    await deleteSchedule(itemToDelete.value.id)
  } else if (mode === 'section') {
    await deleteSchedulesBySection(itemToDelete.value.courseId, itemToDelete.value.section)
  }
  
  showDeleteConfirm.value = false
  itemToDelete.value = null
}
</script>

<template>
  <div class="p-4 sm:p-6 md:p-8 max-w-[1700px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700">
    <!-- Navbar de Tabs Modernizado -->
    <div class="flex flex-col sm:flex-row gap-4 border-b border-gray-100 pb-1 items-center">
      <div class="flex w-full sm:w-auto bg-gray-100/50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
        <button 
          @click="activeTab = 'schedule'"
          class="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 whitespace-nowrap"
          :class="activeTab === 'schedule' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
        >
          Horarios
        </button>
        <button 
          @click="activeTab = 'entities'"
          class="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 whitespace-nowrap"
          :class="activeTab === 'entities' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
        >
          Gestión
        </button>
        <button 
          @click="activeTab = 'rooms'"
          class="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 whitespace-nowrap"
          :class="activeTab === 'rooms' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
        >
          Salones
        </button>
        <router-link 
          to="/monitor"
          class="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:text-blue-600 whitespace-nowrap"
        >
          Monitor
        </router-link>
      </div>

      <!-- Selector de Vista (Visible solo en Horarios) -->
      <div v-if="activeTab === 'schedule'" class="flex bg-gray-100/50 p-1 rounded-xl w-full sm:w-auto sm:ml-auto">
        <button 
          @click="viewMode = 'daily'"
          class="flex-1 sm:px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all"
          :class="viewMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'"
        >
          Salones
        </button>
        <button 
          @click="viewMode = 'weekly'"
          class="flex-1 sm:px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all"
          :class="viewMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'"
        >
          Semana
        </button>
      </div>
    </div>

    <!-- VISTA 1: PLANIFICACIÓN -->
    <div v-if="activeTab === 'schedule'" class="space-y-6 md:space-y-8 animate-in slide-in-from-left duration-500">
      <header class="flex flex-col gap-6">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter italic leading-none">
              Planificador <span class="text-blue-600">Pro</span>
            </h1>
            <p class="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Gestión de horarios en tiempo real
            </p>
          </div>

          <button 
            @click="toggleFullScreen"
            class="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95"
          >
            <span v-if="!isFullScreen">⛶ Pantalla Completa</span>
            <span v-else>✕ Salir</span>
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-gray-100 shadow-sm">
          <!-- Selector de Fecha Compacto -->
          <div class="flex items-center justify-between gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button @click="const d = new Date(selectedDate + 'T00:00:00'); d.setDate(d.getDate() - 1); selectedDate = d.toISOString().split('T')[0]" class="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all shadow-sm">◀</button>
            <div class="relative flex flex-col items-center px-4">
              <span class="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Fecha seleccionada</span>
              <input type="date" v-model="selectedDate" class="bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest text-blue-600 cursor-pointer" />
            </div>
            <button @click="const d = new Date(selectedDate + 'T00:00:00'); d.setDate(d.getDate() + 1); selectedDate = d.toISOString().split('T')[0]" class="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all shadow-sm">▶</button>
          </div>

          <!-- Selector de Días Horizontal -->
          <div class="flex gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar snap-x w-full">
            <button 
              v-for="day in daysOfWeek" :key="day.id"
              @click="selectDayAndDate(day.id)"
              class="flex-none min-w-[90px] lg:min-w-0 lg:flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all snap-center shadow-sm"
              :class="selectedDay === day.id ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'"
            >
              {{ day.name }}
            </button>
          </div>

          <!-- Selector de Salón para Vista Semanal (Compacto) -->
          <div v-if="viewMode === 'weekly'" class="flex bg-blue-50/50 p-1 rounded-xl border border-blue-100 overflow-x-auto no-scrollbar">
            <button 
              v-for="room in rooms" :key="room"
              @click="activeRoom = room"
              class="px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap"
              :class="activeRoom === room ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-300'"
            >
              R{{ room }}
            </button>
          </div>
        </div>
      </header>

      <div :class="{ 'full-screen-wrapper': isFullScreen }">
        <div v-if="isFullScreen" class="mb-6 flex justify-between items-center">
           <h2 class="text-2xl font-black text-gray-900 tracking-tighter">Vista Panorámica - {{ daysOfWeek.find(d => d.id === selectedDay)?.name }}</h2>
           <button @click="toggleFullScreen" class="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all">
             Cerrar Vista
           </button>
        </div>
        <ScheduleGrid 
          :timeSlots="['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00']"
          :rooms="rooms" :schedules="schedules" :selectedDay="selectedDay" :selectedDate="selectedDate" :timelinePosition="timelinePosition"
          :viewMode="viewMode" :activeRoom="activeRoom"
          @cellClick="openCreateModal" @editClick="openEditModal" @delete="confirmDeleteSchedule" @move="upsertSchedule"
          :class="{ 'full-screen-grid': isFullScreen }"
        />
      </div>
    </div>

    <!-- VISTA 2: GESTIÓN DE ENTIDADES -->
    <div v-else-if="activeTab === 'entities'" class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 animate-in slide-in-from-right duration-500">
      <!-- Profesores -->
      <section class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            Docentes
          </h3>
          <span class="px-3 py-1 bg-gray-100 rounded-full text-[9px] md:text-[10px] font-black text-gray-400 uppercase">{{ professors.length }} Total</span>
        </div>

        <div class="flex gap-2 mb-4">
          <input v-model="newProf" type="text" placeholder="Nuevo Profesor..." class="flex-1 px-4 md:px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none font-bold text-sm" @keyup.enter="handleAddProfessor" />
          <button @click="handleAddProfessor" class="px-4 md:px-6 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all">+</button>
        </div>

        <div class="mb-4 relative">
          <input v-model="searchProf" type="text" placeholder="Buscar docente..." class="w-full px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
        </div>

        <div class="space-y-2 flex-1 overflow-y-auto pr-2 min-h-[300px] md:min-h-[400px]">
          <div v-for="p in filteredProfessors" :key="p.id" class="flex justify-between items-center p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
            <div v-if="editingProfId === p.id" class="flex-1 flex gap-2">
              <input v-model="editValue" class="flex-1 px-3 py-1 border-2 border-blue-400 rounded-lg outline-none font-bold" @keyup.enter="saveEditProf(p.id)" />
              <button @click="saveEditProf(p.id)" class="text-blue-600 font-black text-xs uppercase">Ok</button>
            </div>
            <div v-else class="flex-1 flex justify-between items-center">
              <span class="font-bold text-gray-700 text-sm">{{ p.name }}</span>
              <div class="flex gap-3 ml-4">
                <button @click="startEditProf(p)" class="text-gray-400 hover:text-blue-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button @click="confirmDeleteProf(p.id)" class="text-gray-400 hover:text-red-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Cursos -->
      <section class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            Cursos
          </h3>
          <span class="px-3 py-1 bg-gray-100 rounded-full text-[9px] md:text-[10px] font-black text-gray-400 uppercase">{{ courses.length }} Total</span>
        </div>

        <div class="flex gap-2 mb-4">
          <input v-model="newCourse" type="text" placeholder="Nuevo Curso..." class="flex-1 px-4 md:px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-600 outline-none font-bold text-sm" @keyup.enter="handleAddCourse" />
          <button @click="handleAddCourse" class="px-4 md:px-6 py-3 bg-emerald-600 text-white font-black rounded-xl shadow-lg hover:bg-emerald-700 transition-all">+</button>
        </div>

        <div class="mb-4 relative">
          <input v-model="searchCourse" type="text" placeholder="Buscar curso..." class="w-full px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-100 outline-none" />
        </div>

        <div class="space-y-2 flex-1 overflow-y-auto pr-2 min-h-[300px] md:min-h-[400px]">
          <div v-for="c in filteredCourses" :key="c.id" class="flex justify-between items-center p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all">
            <div v-if="editingCourseId === c.id" class="flex-1 flex gap-2">
              <input v-model="editValue" class="flex-1 px-3 py-1 border-2 border-emerald-400 rounded-lg outline-none font-bold" @keyup.enter="saveEditCourse(c.id)" />
              <button @click="saveEditCourse(c.id)" class="text-emerald-600 font-black text-xs uppercase">Ok</button>
            </div>
            <div v-else class="flex-1 flex justify-between items-center">
              <span class="font-bold text-gray-700 text-sm">{{ c.name }}</span>
              <div class="flex gap-3 ml-4">
                <button @click="startEditCourse(c)" class="text-gray-400 hover:text-emerald-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button @click="confirmDeleteCourse(c.id)" class="text-gray-400 hover:text-red-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- VISTA 3: GESTIÓN DE SALONES -->
    <div v-else-if="activeTab === 'rooms'" class="animate-in slide-in-from-bottom duration-500">
      <section class="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h3 class="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter">
              Control de Salones
            </h3>
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configuración de ambientes y capacidad de PCs</p>
          </div>
          <span class="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{{ roomsFull.length }} Ambientes</span>
        </div>

        <div class="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div class="flex flex-col gap-2">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Salón</label>
              <input v-model="newRoom" type="text" placeholder="Ej: 201, 405..." class="px-5 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:border-purple-600 outline-none font-bold text-sm shadow-sm" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Capacidad PCs</label>
              <input v-model.number="newRoomCapacity" type="number" placeholder="0" class="px-5 py-3.5 bg-white border-2 border-gray-100 rounded-xl focus:border-purple-600 outline-none font-bold text-sm shadow-sm" />
            </div>
            <button @click="handleAddRoom" class="h-[52px] bg-purple-600 text-white font-black rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all uppercase tracking-widest text-[10px]">
              Registrar Nuevo Ambiente
            </button>
          </div>
        </div>

        <div class="mb-6 relative max-w-md">
          <input v-model="searchRoom" type="text" placeholder="Filtrar por nombre..." class="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-purple-50 outline-none shadow-sm" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 max-h-[600px]">
          <div v-for="r in filteredRooms" :key="r.id" class="relative group">
            <div class="p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-purple-200 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
              <div v-if="editingRoomId === r.id" class="space-y-4">
                <input v-model="editValue" class="w-full px-4 py-2 border-2 border-purple-400 rounded-xl outline-none font-bold text-sm" @keyup.enter="saveEditRoom(r.id)" />
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-black text-gray-400 uppercase">PCs:</span>
                  <input v-model.number="editCapacity" type="number" class="w-20 px-3 py-1 border-2 border-purple-400 rounded-xl outline-none font-bold text-sm" />
                </div>
                <button @click="saveEditRoom(r.id)" class="w-full py-2 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Guardar</button>
              </div>
              <div v-else>
                <div class="flex justify-between items-start mb-4">
                  <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black text-lg">
                    {{ r.name.charAt(0) }}
                  </div>
                  <div class="flex gap-2">
                    <button @click="startEditRoom(r)" class="p-2 text-gray-300 hover:text-purple-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button @click="confirmDeleteRoom(r.id)" class="p-2 text-gray-300 hover:text-red-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
                <h4 class="text-xl font-black text-gray-900 mb-1">Salón {{ r.name }}</h4>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-green-500"></div>
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activo</span>
                </div>
                
                <div class="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Capacidad</span>
                  <div class="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl">
                    <span class="text-xs font-black text-purple-600 tabular-nums">{{ r.capacity || 0 }}</span>
                    <span class="text-[8px] font-bold text-gray-400 uppercase">PCs</span>
                  </div>
                </div>
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

    <!-- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN MODERNO -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDeleteConfirm = false"></div>
      
      <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div class="p-8 text-center">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </div>
          
          <h3 class="text-2xl font-black text-gray-900 tracking-tighter mb-2">Eliminar Horario</h3>
          <p class="text-gray-500 font-medium mb-8">
            Estás por eliminar el horario de <span class="font-black text-gray-900">{{ itemToDelete?.courseName }}</span>. 
            ¿Cómo deseas proceder?
          </p>

          <div class="space-y-3">
            <button 
              @click="executeDelete('single')"
              class="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              Eliminar solo este bloque
            </button>
            
            <button 
              @click="executeDelete('section')"
              class="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95"
            >
              Eliminar toda la SECCIÓN {{ itemToDelete?.section }}
            </button>
            
            <button 
              @click="showDeleteConfirm = false"
              class="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 text-center">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Esta acción no se puede deshacer</p>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN GENÉRICO MODERNO -->
    <div v-if="showGenericConfirm" class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showGenericConfirm = false"></div>
      
      <div class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div class="p-8 text-center">
          <div class="w-20 h-20 bg-gray-50 text-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          
          <h3 class="text-2xl font-black text-gray-900 tracking-tighter mb-2">{{ genericConfirmTitle }}</h3>
          <p class="text-gray-500 font-medium mb-8">
            {{ genericConfirmMessage }}
          </p>

          <div class="space-y-3">
            <button 
              @click="executeGenericAction"
              class="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95"
            >
              Confirmar Eliminación
            </button>
            
            <button 
              @click="showGenericConfirm = false"
              class="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
        
        <div class="bg-gray-50 p-4 text-center">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Esta acción es irreversible</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.full-screen-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: #f8fafc;
  padding: 1rem;
  overflow-y: auto;
  animation: fullScreenIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 768px) {
  .full-screen-wrapper {
    padding: 2rem;
  }
}

@keyframes fullScreenIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

:deep(.full-screen-grid .grid-scroll-container) {
  max-height: none !important;
  height: calc(100vh - 120px) !important;
}

@media (max-width: 768px) {
  :deep(.grid-content) {
    min-width: 800px !important;
  }
}
</style>
