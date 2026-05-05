/**
 * Servicio para la persistencia de horarios
 * Preparado para integración futura con backend
 */
const STORAGE_KEY = 'systematic_schedules'

export const scheduleService = {
  async getAll() {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  async save(schedules) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
  },

  // Método placeholder para API real
  async fetchFromApi() {
    // return axios.get('/api/schedules')
    console.log('Fetching from API placeholder...')
    return []
  }
}
