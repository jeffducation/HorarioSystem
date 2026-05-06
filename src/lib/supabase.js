import { createClient } from '@supabase/supabase-js'

// En Vite, las variables de entorno deben empezar con VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ SUPABASE CONFIG MISSING: Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel Settings.')
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
)
