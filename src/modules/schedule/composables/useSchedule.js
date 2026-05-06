import { ref, computed, onMounted, onUnmounted } from 'vue'
import { scheduleService } from '../services/scheduleService'
import { supabase } from '@/lib/supabase'

export function useSchedule() {
  const schedules = ref([])
  const professors = ref([])
  const courses = ref([])
  const rooms = ref(['201', '202', '301', '401', '402', 'Multiuso'])
  const selectedDay = ref(new Date().getDay())
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const currentTime = ref(new Date())

  // --- DATA LOADING ---
  const loadInitialData = async () => {
    try {
      const [s, p, c] = await Promise.all([
        scheduleService.getSchedules(),
        scheduleService.getProfessors(),
        scheduleService.getCourses()
      ])
      schedules.value = s
      professors.value = p
      courses.value = c
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // --- REAL-TIME SUBSCRIPTIONS ---
  const setupSubscriptions = () => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', table: 'schedules', schema: 'public' }, () => loadInitialData())
      .on('postgres_changes', { event: '*', table: 'professors', schema: 'public' }, () => loadInitialData())
      .on('postgres_changes', { event: '*', table: 'courses', schema: 'public' }, () => loadInitialData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  onMounted(() => {
    loadInitialData()
    const cleanup = setupSubscriptions()
    const timer = setInterval(() => { currentTime.value = new Date() }, 1000)
    
    onUnmounted(() => {
      cleanup()
      clearInterval(timer)
    })
  })

  // --- COMPUTED ---
  const currentTimeString = computed(() => {
    return currentTime.value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  })

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
        progress: calculateProgress(s.startTime, s.endTime)
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

  // --- ACTIONS ---
  const upsertSchedule = async (data) => {
    try {
      const days = data.daysOfWeek || [data.dayOfWeek]
      const weeksToRepeat = data.weeksToRepeat || 1
      
      // Ordenar días cronológicamente (Lu=1...Do=7)
      const sortedDays = [...days].sort((a, b) => {
        const aVal = a === 0 ? 7 : a
        const bVal = b === 0 ? 7 : b
        return aVal - bVal
      })

      const baseSession = parseInt(data.session) || 1
      let sessionCounter = 0
      
      const promises = []
      
      // Usar la fecha seleccionada o la del formulario como base
      const referenceDate = new Date((data.startDate || selectedDate.value) + 'T00:00:00')
      
      for (let w = 0; w < weeksToRepeat; w++) {
        for (const day of sortedDays) {
          // Encontrar la fecha para este 'day' en la semana 'w'
          // Primero buscamos el inicio de la semana de la referenceDate (Lunes)
          const startOfWeek = new Date(referenceDate)
          const dayOffset = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1
          startOfWeek.setDate(startOfWeek.getDate() - dayOffset + (w * 7))
          
          // Ahora sumamos los días necesarios para llegar al 'day' (Lu=1...Do=7)
          const targetDayVal = day === 0 ? 6 : day - 1
          const targetDate = new Date(startOfWeek)
          targetDate.setDate(targetDate.getDate() + targetDayVal)
          
          // Formatear fecha local (evita desfases de zona horaria)
          const dateStr = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getDate().toString().padStart(2, '0')}`

          promises.push(scheduleService.upsertSchedule({
            ...data,
            dayOfWeek: day,
            date: dateStr,
            // El incremento es global: base + (semana * días por semana) + índice del día
            session: (baseSession + sessionCounter).toString().padStart(2, '0')
          }))
          sessionCounter++
        }
      }
      
      await Promise.all(promises)
    } catch (error) {
      console.error('Error saving schedule:', error)
      throw error
    }
  }

  const deleteSchedulesBySection = async (courseId, section) => {
    try {
      const targets = schedules.value.filter(s => s.courseId === courseId && s.section === section)
      await Promise.all(targets.map(s => scheduleService.deleteSchedule(s.id)))
    } catch (error) {
      console.error('Error deleting section:', error)
      throw error
    }
  }

  return {
    schedules, rooms, selectedDay, selectedDate, professors, courses, 
    currentTimeString, activeSchedules, timelinePosition,
    upsertSchedule, 
    deleteSchedulesBySection,
    deleteSchedule: async (id) => { await scheduleService.deleteSchedule(id) },
    addProfessor: async (name) => { await scheduleService.upsertProfessor({ name }) },
    updateProfessor: async (id, name) => { await scheduleService.upsertProfessor({ id, name }) },
    deleteProfessor: async (id) => { await scheduleService.deleteProfessor(id) },
    addCourse: async (name, duration = 120) => { await scheduleService.upsertCourse({ name, default_duration: duration }) },
    updateCourse: async (id, name) => { await scheduleService.upsertCourse({ id, name }) },
    deleteCourse: async (id) => { await scheduleService.deleteCourse(id) }
  }
}
