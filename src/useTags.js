import { ref, onMounted } from 'vue'
import { supabase } from './supabase.js'

export function useTags(scope, table) {
  const tags = ref([])
  const tagUsage = ref({})

  async function loadTags() {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .or(scope ? `scope.eq.${scope},scope.eq.all` : 'scope.eq.all')
      .order('name')
    if (data) tags.value = data
  }

  async function loadUsage() {
    if (!table) return
    const { data } = await supabase.from(table).select('tag')
    const counts = {}
    for (const row of data || []) counts[row.tag] = (counts[row.tag] || 0) + 1
    tagUsage.value = counts
  }

  async function addTag(name, color) {
    const { error } = await supabase
      .from('tags')
      .insert([{ name: name.trim(), color, scope: scope || 'all' }])
    if (!error) await loadTags()
    return { error }
  }

  async function updateTag(id, name, color) {
    const { error } = await supabase
      .from('tags')
      .update({ name: name.trim(), color })
      .eq('id', id)
    if (!error) await loadTags()
    return { error }
  }

  async function deleteTag(id) {
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (!error) await loadTags()
    return { error }
  }

  onMounted(loadTags)

  return { tags, tagUsage, loadUsage, addTag, updateTag, deleteTag }
}
