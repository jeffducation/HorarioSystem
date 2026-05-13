import { ref, computed, onMounted, onUnmounted } from 'vue'
import { scheduleService } from '../services/scheduleService'
import { supabase } from '@/lib/supabase'

export function useSchedule() {
  const schedules = ref([])
  const professors = ref([])
  const courses = ref([])
  const rooms = ref([])
  const roomsFull = ref([])
  const selectedDay = ref(new Date().getDay())
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const realTime = ref(new Date())
  const simulatedTime = ref(null)
  const currentTime = computed(() => simulatedTime.value || realTime.value)
  const announcedEvents = ref(new Set())

  // --- DATA LOADING ---
  const loadInitialData = async () => {
    try {
      const [s, p, c, r] = await Promise.all([
        scheduleService.getSchedules(),
        scheduleService.getProfessors(),
        scheduleService.getCourses(),
        scheduleService.getRooms()
      ])
      schedules.value = s
      professors.value = p
      courses.value = c
      roomsFull.value = r
      rooms.value = r.map(room => ({ id: room.id, name: room.name }))
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
      .on('postgres_changes', { event: '*', table: 'rooms', schema: 'public' }, () => loadInitialData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  onMounted(() => {
    loadInitialData()
    const cleanup = setupSubscriptions()
    const timer = setInterval(() => { realTime.value = new Date() }, 1000)
    
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
    const now = currentTime.value
    const today = now.getDay()
    const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`

    const results = []
    
    rooms.value.forEach(roomObj => {
      // Filtrar todos los horarios de este salón para hoy
      const todaySchedules = schedules.value.filter(s => {
        const roomMatch = s.roomId === roomObj.id
        const dateMatch = s.date ? s.date === todayStr : s.dayOfWeek === today
        return roomMatch && dateMatch
      }).sort((a, b) => a.startTime.localeCompare(b.startTime))

      // Buscar si hay uno activo
      const active = todaySchedules.find(s => nowStr >= s.startTime && nowStr < s.endTime)
      
      const getCourseColor = (name) => {
        const n = name.toLowerCase()
        if (n.includes('excel')) return '#107C41' // Excel Green
        if (n.includes('diseño')) return '#F58220' // Design Orange
        if (n.includes('power')) return '#F2C811' // Power BI Yellow
        if (n.includes('auto')) return '#E52D27' // AutoCAD Red
        return '#0078D4' // Revit / Default Blue
      }

      if (active) {
        results.push({
          ...active,
          room: roomObj.name, // Aseguramos que el nombre esté para la UI
          isNextClass: false,
          progress: calculateProgress(active.startTime, active.endTime),
          color: getCourseColor(active.courseName)
        })
      } else {
        // Buscar el siguiente
        const next = todaySchedules.find(s => s.startTime > nowStr)
        if (next) {
          results.push({
            ...next,
            room: roomObj.name,
            isNextClass: true,
            progress: 0,
            color: getCourseColor(next.courseName)
          })
        }
      }
    })

    return results
  })

  // --- ANNOUNCEMENT LOGIC ---
  const speak = (text) => {
    if (!window.speechSynthesis) return
    
    // Detener cualquier anuncio previo para evitar cola excesiva
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Intentar buscar una voz más "premium" o natural
    const voices = window.speechSynthesis.getVoices()
    // Preferencias: Google (Chrome), Microsoft (Edge), o voces específicas de calidad
    const preferredVoice = voices.find(v => 
      (v.lang.includes('es') && v.name.includes('Google')) || 
      (v.lang.includes('es') && v.name.includes('Natural')) ||
      (v.lang.includes('es') && v.name.includes('Microsoft'))
    )

    if (preferredVoice) utterance.voice = preferredVoice
    
    utterance.lang = 'es-ES'
    utterance.rate = 1.0 // Un poco más rápido para sonar más dinámico
    utterance.pitch = 1.1 // Un tono ligeramente más agudo para sonar más "tecnológico"
    utterance.volume = 1.0
    
    window.speechSynthesis.speak(utterance)
  }

  const checkEvents = () => {
    activeSchedules.value.forEach(s => {
      const startKey = `start-${s.id}`
      const endKey = `end-${s.id}`

      // Alerta de inicio: si es NextClass y falta poco o acaba de empezar
      if (s.isNextClass) {
        const [h, m] = s.startTime.split(':').map(Number)
        const startTime = new Date(currentTime.value).setHours(h, m, 0)
        const diffMinutes = (startTime - currentTime.value) / (1000 * 60)
        
        if (diffMinutes <= 5 && diffMinutes > 0 && !announcedEvents.value.has(startKey)) {
          speak(`Atención. En breve se iniciará la clase de  ${s.courseName} en el salón ${s.room}.`)
          announcedEvents.value.add(startKey)
        }
      }

      // Alerta de culminación (85% o más)
      if (!s.isNextClass && s.progress >= 85 && !announcedEvents.value.has(endKey)) {
        speak(`Atención. La clase de ${s.courseName} en el salón ${s.room} está por culminar.`)
        announcedEvents.value.add(endKey)
      }
    })
  }

  // Ejecutar checkEvents cada minuto o cuando cambie currentTime
  onMounted(() => {
    const eventTimer = setInterval(checkEvents, 30000)
    onUnmounted(() => clearInterval(eventTimer))
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
      // Si el dato tiene ID, es una actualización. El usuario quiere que se replique
      // el cambio en todos los bloques que pertenecen a la misma sección/grupo.
      if (data.id) {
        const original = schedules.value.find(s => s.id === data.id)
        if (!original) return

        // Filtrar todos los bloques que pertenecen al mismo curso y sección ORIGINAL
        const related = schedules.value.filter(s => 
          s.courseId === original.courseId && 
          s.section === original.section
        )

        const promises = related.map(s => scheduleService.upsertSchedule({
          ...s,
          // Aplicamos los cambios comunes pero mantenemos ID, fecha y sesión propia
          courseId: data.courseId,
          professorId: data.professorId,
          roomId: data.roomId,
          startTime: data.startTime,
          endTime: data.endTime,
          module: data.module,
          section: data.section
        }))

        await Promise.all(promises)
      } else {
        // Lógica de creación con repetición
        const days = data.daysOfWeek || [data.dayOfWeek]
        const weeksToRepeat = data.weeksToRepeat || 1
        
        const sortedDays = [...days].sort((a, b) => {
          const aVal = a === 0 ? 7 : a
          const bVal = b === 0 ? 7 : b
          return aVal - bVal
        })

        const baseSession = parseInt(data.session) || 1
        let sessionCounter = 0
        const promises = []
        const referenceDate = new Date((data.startDate || selectedDate.value) + 'T00:00:00')
        
        for (let w = 0; w < weeksToRepeat; w++) {
          for (const day of sortedDays) {
            const startOfWeek = new Date(referenceDate)
            const dayOffset = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1
            startOfWeek.setDate(startOfWeek.getDate() - dayOffset + (w * 7))
            
            const targetDayVal = day === 0 ? 6 : day - 1
            const targetDate = new Date(startOfWeek)
            targetDate.setDate(targetDate.getDate() + targetDayVal)
            
            const dateStr = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getDate().toString().padStart(2, '0')}`

            promises.push(scheduleService.upsertSchedule({
              ...data,
              dayOfWeek: day,
              date: dateStr,
              session: (baseSession + sessionCounter).toString().padStart(2, '0')
            }))
            sessionCounter++
          }
        }
        await Promise.all(promises)
      }
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
    deleteCourse: async (id) => { await scheduleService.deleteCourse(id) },
    addRoom: async (name, capacity = 0) => { await scheduleService.upsertRoom({ name, capacity }) },
    updateRoom: async (id, name, capacity) => { await scheduleService.upsertRoom({ id, name, capacity }) },
    deleteRoom: async (id) => { await scheduleService.deleteRoom(id) },
    roomsFull,
    simulatedTime,
    setSimulatedTime: (time) => { simulatedTime.value = time },
    resetTime: () => { simulatedTime.value = null }
  }
}
