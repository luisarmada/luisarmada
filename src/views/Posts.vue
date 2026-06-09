<template>
  <div class="page">
    <div class="tags">
      <span class="tags-label">tags:</span>
      <button
        class="tag"
        :class="{ active: activeTag === 'all' }"
        :style="activeTag === 'all' ? {} : {}"
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
    </div>

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
        <div class="post-header">
          <span class="post-title">{{ post.title }}</span>
          <span class="post-date">{{ formatDate(post.date) }}</span>
          <span class="post-tag" :style="tagStyle(post.tag)">{{ post.tag }}</span>
        </div>
        <p class="post-desc">{{ post.description }}</p>
      </div>
      <p v-if="filtered.length === 0" class="muted">no posts yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import { useTags } from '../useTags.js'
import { useAuth } from '../useAuth.js'

const posts = ref([])
const loading = ref(true)
const error = ref(false)
const activeTag = ref('all')

const { session } = useAuth()
const { tags } = useTags('posts')
const availableTags = computed(() => tags.value.map(t => ({ name: t.name, color: t.color })))

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
</style>
