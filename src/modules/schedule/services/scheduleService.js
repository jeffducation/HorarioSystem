import { supabase } from '@/lib/supabase'

export const scheduleService = {
  // --- CURSOS ---
  async getCourses() {
    const { data, error } = await supabase.from('courses').select('*').order('name')
    if (error) throw error
    return data
  },

  async upsertCourse(course) {
    const { data, error } = await supabase.from('courses').upsert(course).select().single()
    if (error) throw error
    return data
  },

  async deleteCourse(id) {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) throw error
  },

  // --- PROFESORES ---
  async getProfessors() {
    const { data, error } = await supabase.from('professors').select('*').order('name')
    if (error) throw error
    return data
  },

  async upsertProfessor(professor) {
    const { data, error } = await supabase.from('professors').upsert(professor).select().single()
    if (error) throw error
    return data
  },

  async deleteProfessor(id) {
    const { error } = await supabase.from('professors').delete().eq('id', id)
    if (error) throw error
  },

  // --- SALONES ---
  async getRooms() {
    const { data, error } = await supabase.from('rooms').select('*').order('name')
    if (error) throw error
    return data
  },

  async upsertRoom(room) {
    const { data, error } = await supabase.from('rooms').upsert(room).select().single()
    if (error) throw error
    return data
  },

  async deleteRoom(id) {
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) throw error
  },

  // --- HORARIOS ---
  async getSchedules() {
    const { data, error } = await supabase
      .from('schedules')
      .select('*, courses(*), professors(*), rooms(*)')
    if (error) throw error
    
    // Mapeo para mantener compatibilidad con el frontend
    return data.map(s => ({
      id: s.id,
      courseId: s.course_id,
      courseName: s.courses?.name || 'Desconocido',
      professorId: s.professor_id,
      professor: s.professors?.name || 'Desconocido',
      roomId: s.room_id,
      room: s.rooms?.name || 'S/N',
      startTime: s.start_time,
      endTime: s.end_time,
      dayOfWeek: s.day_of_week,
      date: s.schedule_date,
      section: s.section,
      module: s.module,
      session: s.session,
      color: s.courses?.color || '#3b82f6'
    }))
  },

  async upsertSchedule(schedule) {
    // Asegurarse de que el objeto coincida con la base de datos
    const dbSchedule = {
      id: schedule.id || undefined,
      course_id: schedule.courseId || null,
      professor_id: schedule.professorId || null,
      room_id: schedule.roomId || null,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      day_of_week: schedule.dayOfWeek,
      schedule_date: schedule.date || null,
      section: schedule.section || null,
      module: schedule.module || null,
      session: schedule.session || null
    }

    const { data, error } = await supabase.from('schedules').upsert(dbSchedule).select().single()
    if (error) throw error
    return data
  },

  async deleteSchedule(id) {
    const { error } = await supabase.from('schedules').delete().eq('id', id)
    if (error) throw error
  }
}
