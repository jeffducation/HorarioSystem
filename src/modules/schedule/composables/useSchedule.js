import { ref, computed, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = 'systematic_v4_neon'

export function useSchedule() {
  const schedules = ref([])
  const professors = ref([])
  
  // Cursos por defecto con colores Neón
  const courses = ref([
    { id: 'c1', name: 'EXCEL PROFESIONAL', color: '#00ff88', defaultDuration: 180 }, // Verde Neón
    { id: 'c2', name: 'OFIMATICA', color: '#00d9ff', defaultDuration: 120 },        // Cian
    { id: 'c3', name: 'AUTOCAD', color: '#ff2d55', defaultDuration: 120 },         // Rojo Neón
    { id: 'c4', name: 'REVIT', color: '#ffcc00', defaultDuration: 180 },           // Amarillo
    { id: 'c5', name: 'SAP B1', color: '#bf5af2', defaultDuration: 120 },          // Púrpura
    { id: 'c6', name: 'POWER BI', color: '#5e5ce6', defaultDuration: 120 },        // Azul Eléctrico
    { id: 'c7', name: 'MS PROJECT', color: '#ff9f0a', defaultDuration: 120 }       // Naranja
  ])

  const rooms = ref(['201', '202', '301', '401', '402', 'Multiuso'])
  const selectedDay = ref(new Date().getDay() || 1)
  const currentTime = ref(new Date())

  // --- PERSISTENCIA ---
  const saveAll = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schedules: schedules.value,
      professors: professors.value,
      courses: courses.value
    }))
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
  }

  const loadAll = () => {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      schedules.value = parsed.schedules || []
      professors.value = parsed.professors || []
      // Solo cargar cursos si hay nuevos, si no mantener los default
      if (parsed.courses?.length > 0) courses.value = parsed.courses
    }
  }

  onMounted(() => {
    loadAll()
    window.addEventListener('storage', () => loadAll())
    const timer = setInterval(() => { currentTime.value = new Date() }, 1000)
    onUnmounted(() => clearInterval(timer))
  })

  const currentTimeString = computed(() => {
    return currentTime.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  })

  // Cálculo de progreso real para el monitor
  const calculateProgress = (start, end) => {
    const now = currentTime.value
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    
    const startDate = new Date(now).setHours(startH, startM, 0)
    const endDate = new Date(now).setHours(endH, endM, 0)
    
    if (now < startDate) return 0
    if (now > endDate) return 100
    
    const total = endDate - startDate
    const current = now - startDate
    return Math.round((current / total) * 100)
  }

  const activeSchedules = computed(() => {
    const nowStr = currentTimeString.value
    const today = currentTime.value.getDay()
    return schedules.value.filter(s => s.dayOfWeek === today && nowStr >= s.startTime && nowStr < s.endTime)
      .map(s => ({
        ...s,
        progress: calculateProgress(s.startTime, s.endTime),
        color: courses.value.find(c => c.name === s.courseName)?.color || '#3b82f6'
      }))
  })

  const timelinePosition = computed(() => {
    const h = currentTime.value.getHours()
    const m = currentTime.value.getMinutes()
    if (h < 7 || h > 23) return -1
    const startHour = 7
    const totalHours = 17
    const currentPosition = (h - startHour) + (m / 60)
    return (currentPosition / totalHours) * 100
  })

  const upsertSchedule = (data) => {
    const courseColor = courses.value.find(c => c.name === data.courseName)?.color || '#3b82f6'
    
    if (data.id) {
      const idx = schedules.value.findIndex(s => s.id === data.id)
      if (idx !== -1) {
        schedules.value[idx] = { ...data, color: courseColor }
      }
    } else {
      const days = data.daysOfWeek || [data.dayOfWeek]
      days.forEach(day => {
        schedules.value.push({ 
          ...data, 
          id: crypto.randomUUID(), 
          dayOfWeek: day,
          color: courseColor
        })
      })
    }
    saveAll()
  }

  return {
    schedules, rooms, selectedDay, professors, courses, 
    currentTimeString, activeSchedules, timelinePosition,
    upsertSchedule, deleteSchedule: (id) => { schedules.value = schedules.value.filter(s => s.id !== id); saveAll() },
    addProfessor: (name) => { professors.value.push({ id: crypto.randomUUID(), name }); saveAll() },
    updateProfessor: (id, name) => { const p = professors.value.find(x => x.id === id); if (p) p.name = name; saveAll() },
    deleteProfessor: (id) => { professors.value = professors.value.filter(x => x.id !== id); saveAll() },
    updateCourse: (id, name) => { const c = courses.value.find(x => x.id === id); if (c) c.name = name; saveAll() },
    deleteCourse: (id) => { courses.value = courses.value.filter(x => x.id !== id); saveAll() }
  }
}
