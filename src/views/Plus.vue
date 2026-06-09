<template>
  <div class="page">
    <div class="tags">
      <span class="tags-label">tags:</span>
      <button class="tag" :class="{ active: activeTag === 'all' }" @click="activeTag = 'all'">all</button>
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

    <form v-if="session" class="admin-form" @submit.prevent="submitReel">
      <input v-model="newReel.shortcode" type="text" placeholder="instagram shortcode (e.g. DWhIavqjDfk)" required />
      <input v-model="newReel.title" type="text" placeholder="title" required />
      <select v-model="newReel.tag" required>
        <option value="" disabled>tag</option>
        <option v-for="t in tags" :key="t.id" :value="t.name">{{ t.name }}</option>
      </select>
      <input v-model="newReel.date" type="date" required />
      <button type="submit" :disabled="reelSaving">{{ reelSaving ? 'saving...' : 'add reel' }}</button>
      <p v-if="reelMsg" class="form-msg">{{ reelMsg }}</p>
    </form>

    <div v-if="loading" class="muted">loading...</div>
    <div v-else class="grid">
      <div v-for="item in filtered" :key="item.id" class="reel-card">
        <a :href="`https://www.instagram.com/reel/${item.shortcode}/`" target="_blank" class="reel-cover">
          <iframe
            :src="`https://www.instagram.com/reel/${item.shortcode}/embed/captioned/`"
            frameborder="0"
            scrolling="no"
            allowtransparency
            allowfullscreen
          ></iframe>
          <div class="mask-bottom"></div>
        </a>
        <div class="reel-footer">
          <span class="reel-title">{{ item.title }}</span>
          <div class="reel-meta">
            <span class="reel-date">{{ formatDate(item.date) }}</span>
            <span class="reel-tag" :style="tagStyle(item.tag)">{{ item.tag }}</span>
          </div>
        </div>
      </div>
      <p v-if="filtered.length === 0" class="muted">no reels yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase.js'
import { useTags } from '../useTags.js'
import { useAuth } from '../useAuth.js'
import TagsEditor from '../components/TagsEditor.vue'

const reels = ref([])
const loading = ref(true)
const activeTag = ref('all')
const editingTags = ref(false)

const { session } = useAuth()
const { tags, tagUsage, loadUsage, addTag, updateTag, deleteTag } = useTags('plus', 'plus')
const availableTags = computed(() => tags.value.map(t => ({ name: t.name, color: t.color })))

watch(editingTags, v => { if (v) loadUsage() })

const filtered = computed(() =>
  activeTag.value === 'all' ? reels.value : reels.value.filter(r => r.tag === activeTag.value)
)

function tagStyle(name) {
  const t = tags.value.find(t => t.name === name)
  return t ? { background: t.color + '22', color: t.color } : {}
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

const reelSaving = ref(false)
const reelMsg = ref('')
const newReel = ref({ shortcode: '', title: '', tag: '', date: '' })

async function submitReel() {
  reelSaving.value = true
  reelMsg.value = ''
  const { error } = await supabase.from('plus').insert([{ ...newReel.value }])
  if (error) reelMsg.value = `error: ${error.message}`
  else {
    reelMsg.value = 'saved!'
    newReel.value = { shortcode: '', title: '', tag: '', date: '' }
    await loadReels()
  }
  reelSaving.value = false
}

async function loadReels() {
  const { data } = await supabase
    .from('plus')
    .select('*')
    .order('date', { ascending: false })
  if (data) reels.value = data
}

onMounted(async () => {
  await loadReels()
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

.tags-label {
  font-size: 0.85rem;
  color: #888;
}

.tag {
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.85rem;
  cursor: pointer;
  background: #e8e8e8;
  color: #444;
  font-family: inherit;
  font-weight: 500;
}

.tag:hover { opacity: 0.75; }
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

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.reel-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reel-cover {
  display: block;
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
}

.reel-cover iframe {
  position: absolute;
  top: -54px;
  left: -22.5%;
  width: 145%;
  height: calc(100% + 54px);
  border: none;
  pointer-events: none;
}

.mask-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0px;
  background: #fff;
  z-index: 1;
  pointer-events: none;
}

.reel-footer {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 4px;
  position: relative;
  z-index: 2;
}

.reel-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reel-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #222;
}

.reel-date {
  font-size: 0.8rem;
  color: #aaa;
}

.reel-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
}

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
.admin-form select {
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
.admin-form select:focus { border-color: rgba(0, 0, 0, 0.4); }

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
