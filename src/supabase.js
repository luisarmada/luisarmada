import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lsywlvcugqmzkbvmaekh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeXdsdmN1Z3Ftemtidm1hZWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDkxMjYsImV4cCI6MjA5NjQyNTEyNn0.2sDRv9DsE0EAW_Xb8u2wpDPvrFRItbyALgQ-vN9kvtE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
