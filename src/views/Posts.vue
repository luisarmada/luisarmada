<template>
  <div class="page">
    <div class="tags">
      <span class="tags-label">tags:</span>
      <button
        class="tag"
        :class="{ active: activeTag === 'all' }"
        @click="activeTag = 'all'"
      >all</button>
      <button
        v-for="t in availableTags"
        :key="t.name"
        class="tag"
        :class="{ active: activeTag === t.name }"
        :style="{ background: t.color + '22', color: t.color, borderColor: activeTag === t.name ? t.color : 'transparent' }"
        @click="activeTag = t.name"
      >{{ t.name }}</button>
      <button v-if="session" class="tags-edit-btn" @click="editingTags = !editingTags">
        {{ editingTags ? 'done' : 'edit tags' }}
      </button>
    </div>

    <TagsEditor
      v-if="session && editingTags"
      :tags="tags"
      :tagUsage="tagUsage"
      :addTag="addTag"
      :updateTag="updateTag"
      :deleteTag="deleteTag"
    />

    <form v-if="session" class="admin-form" @submit.prevent="submitPost">
      <input v-model="newPost.title" type="text" placeholder="title" required />
      <input v-model="newPost.description" type="text" placeholder="description" required />
      <select v-model="newPost.tag" required>
        <option value="" disabled>tag</option>
        <option v-for="t in tags" :key="t.id" :value="t.name">{{ t.name }}</option>
      </select>
      <textarea v-model="newPost.body" placeholder="body" rows="4"></textarea>
      <input v-model="newPost.date" type="date" required />
      <button type="submit" :disabled="posting">{{ posting ? 'saving...' : 'add post' }}</button>
      <p v-if="postMsg" class="form-msg">{{ postMsg }}</p>
    </form>

    <div v-if="loading" class="muted">loading...</div>
    <div v-else-if="error" class="muted">failed to load posts.</div>
    <div v-else class="posts">
      <div v-for="post in filtered" :key="post.id" class="post">
        <template v-if="editId === post.id">
          <form class="inline-edit" @submit.prevent="savePost(post)">
            <input v-model="editDraft.title" type="text" required />
            <input v-model="editDraft.description" type="text" required />
            <select v-model="editDraft.tag" required>
              <option value="" disabled>tag</option>
              <option v-for="t in tags" :key="t.id" :value="t.name">{{ t.name }}</option>
            </select>
            <textarea v-model="editDraft.body" rows="4"></textarea>
            <input v-model="editDraft.date" type="date" required />
            <div class="inline-edit-actions">
              <button type="submit" :disabled="saving">{{ saving ? 'saving...' : 'save' }}</button>
              <button type="button" class="cancel-btn" @click="editId = null">cancel</button>
              <button type="button" class="delete-btn" @click="deletePost(post.id)">delete</button>
            </div>
            <p v-if="editMsg" class="form-msg">{{ editMsg }}</p>
          </form>
        </template>
        <template v-else>
          <div class="post-header">
            <span class="post-title">{{ post.title }}</span>
            <span class="post-date">{{ formatDate(post.date) }}</span>
            <span class="post-tag" :style="tagStyle(post.tag)">{{ post.tag }}</span>
            <button v-if="session" class="edit-btn" @click="startEdit(post)">edit</button>
          </div>
          <p class="post-desc">{{ post.description }}</p>
        </template>
      </div>
      <p v-if="filtered.length === 0" class="muted">no posts yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase.js'
import { useTags } from '../useTags.js'
import { useAuth } from '../useAuth.js'
import TagsEditor from '../components/TagsEditor.vue'

const posts = ref([])
const loading = ref(true)
const error = ref(false)
const activeTag = ref('all')
const editingTags = ref(false)

const { session } = useAuth()
const { tags, tagUsage, loadUsage, addTag, updateTag, deleteTag } = useTags('posts', 'posts')
const availableTags = computed(() => tags.value.map(t => ({ name: t.name, color: t.color })))

watch(editingTags, v => { if (v) loadUsage() })

const filtered = computed(() =>
  activeTag.value === 'all' ? posts.value : posts.value.filter(p => p.tag === activeTag.value)
)

function tagStyle(name) {
  const t = tags.value.find(t => t.name === name)
  return t ? { background: t.color + '22', color: t.color } : {}
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

const editId = ref(null)
const editDraft = ref({})
const saving = ref(false)
const editMsg = ref('')

function startEdit(post) {
  editId.value = post.id
  editDraft.value = { title: post.title, description: post.description, tag: post.tag, body: post.body || '', date: post.date }
  editMsg.value = ''
}

async function savePost(post) {
  saving.value = true
  editMsg.value = ''
  const { error } = await supabase.from('posts').update({ ...editDraft.value }).eq('id', post.id)
  if (error) editMsg.value = error.message
  else {
    editId.value = null
    await loadPosts()
  }
  saving.value = false
}

async function deletePost(id) {
  if (!confirm('delete this post?')) return
  await supabase.from('posts').delete().eq('id', id)
  editId.value = null
  await loadPosts()
}

const posting = ref(false)
const postMsg = ref('')
const newPost = ref({ title: '', description: '', tag: '', body: '', date: '' })

async function submitPost() {
  posting.value = true
  postMsg.value = ''
  const { error: err } = await supabase.from('posts').insert([{ ...newPost.value }])
  if (err) postMsg.value = `error: ${err.message}`
  else {
    postMsg.value = 'saved!'
    newPost.value = { title: '', description: '', tag: '', body: '', date: '' }
    await loadPosts()
  }
  posting.value = false
}

async function loadPosts() {
  const { data, error: err } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })
  if (err) error.value = true
  else posts.value = data
}

onMounted(async () => {
  await loadPosts()
  loading.value = false
})
</script>

<style scoped>
.page {
  width: var(--page-width);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.tag {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.85rem;
  cursor: pointer;
  background: #f0f0f0;
  color: #555;
  transition: opacity 0.15s;
  font-family: inherit;
  font-weight: 500;
}

.tag:hover { opacity: 0.75; }

.tags-label {
  font-size: 0.85rem;
  color: #888;
}

.tag.all { background: #e8e8e8; color: #444; }
.tag.quant { background: #d4e8fb; color: #2a5f8a; }
.tag.coding { background: #d6f0e0; color: #2a6644; }
.tag.review { background: #f5dff5; color: #7a3d7a; }

.tag.active { border-color: currentColor; }

.tags-edit-btn {
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 0.15rem 0.3rem;
  margin-left: auto;
}

.tags-edit-btn:hover { color: #000; }

.posts {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.post-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.post-title {
  font-size: 1rem;
  font-weight: 500;
  color: #000;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.35);
  text-underline-offset: 5px;
  cursor: pointer;
}

.post-title:hover { text-decoration-color: rgba(0, 0, 0, 0.7); }

.post-date {
  font-size: 0.85rem;
  color: #888;
}

.post-desc {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #999;
  line-height: 1.5;
}

.post-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  position: relative;
  top: -2px;
}

.post-tag.quant { background: #d4e8fb; color: #2a5f8a; }
.post-tag.coding { background: #d6f0e0; color: #2a6644; }
.post-tag.review { background: #f5dff5; color: #7a3d7a; }

.muted { font-size: 0.9rem; color: #aaa; }

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: #fafafa;
}

.admin-form input,
.admin-form select,
.admin-form textarea {
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  width: 100%;
  outline: none;
  color: #000;
  background: #fff;
  box-sizing: border-box;
}

.admin-form input:focus,
.admin-form select:focus,
.admin-form textarea:focus { border-color: rgba(0, 0, 0, 0.4); }

.admin-form textarea { resize: vertical; }

.admin-form button[type="submit"] {
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  align-self: flex-start;
}

.admin-form button[type="submit"]:disabled { opacity: 0.5; cursor: default; }

.form-msg { font-size: 0.8rem; color: #888; }

.edit-btn {
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 0;
  position: relative;
  top: -1px;
}

.edit-btn:hover { color: #000; }

.inline-edit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.inline-edit input,
.inline-edit select,
.inline-edit textarea {
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  width: 100%;
  outline: none;
  color: #000;
  background: #fff;
  box-sizing: border-box;
}

.inline-edit input:focus,
.inline-edit select:focus,
.inline-edit textarea:focus { border-color: rgba(0, 0, 0, 0.4); }

.inline-edit textarea { resize: vertical; }

.inline-edit-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.inline-edit-actions button {
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  background: #000;
  color: #fff;
}

.inline-edit-actions button:disabled { opacity: 0.5; cursor: default; }

.cancel-btn { background: #f0f0f0 !important; color: #555 !important; }
.delete-btn { background: none !important; color: #ccc !important; margin-left: auto; }
.delete-btn:hover { color: #c00 !important; }
</style>
