import { ref, onMounted } from 'vue'
import { supabase } from './supabase.js'

export function useTags(scope) {
  const tags = ref([])

  onMounted(async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .or(scope ? `scope.eq.${scope},scope.eq.all` : 'scope.eq.all')
      .order('name')
    if (data) tags.value = data
  })

  return { tags }
}
