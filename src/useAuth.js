import { ref } from 'vue'
import { supabase } from './supabase.js'

const session = ref(null)

supabase.auth.getSession().then(({ data }) => {
  session.value = data.session
})

supabase.auth.onAuthStateChange((_, s) => {
  session.value = s
})

export function useAuth() {
  return { session }
}
