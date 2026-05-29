import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xxhuneaqmkierjqfpyrb.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_bMTJ6qwl7WAy30jRhUYkcg_hM6Uf9gU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function getDeviceId() {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = 'device_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now()
    localStorage.setItem('device_id', id)
  }
  return id
}