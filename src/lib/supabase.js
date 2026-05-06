import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wbagmaxtueefhwullcec.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_txVQQE-8bqpyKNrIQNFxvg_lkR_cCup'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
