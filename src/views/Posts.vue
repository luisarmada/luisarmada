<template>
  <div class="page">
    <div class="tags">
      <span class="tags-label">tags:</span>
      <button
        v-for="tag in ['all', ...availableTags]"
        :key="tag"
        class="tag"
        :class="[tag, { active: activeTag === tag }]"
        @click="activeTag = tag"
      >{{ tag }}</button>
    </div>

    <div v-if="loading" class="muted">loading...</div>
    <div v-else-if="error" class="muted">failed to load posts.</div>
    <div v-else class="posts">
      <div v-for="post in filtered" :key="post.id" class="post">
        <div class="post-header">
          <span class="post-title">{{ post.title }}</span>
          <span class="post-date">{{ formatDate(post.date) }}</span>
          <span class="post-tag" :class="post.tag">{{ post.tag }}</span>
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

const posts = ref([])
const loading = ref(true)
const error = ref(false)
const activeTag = ref('all')

const availableTags = ['quant', 'coding', 'review']

const filtered = computed(() =>
  activeTag.value === 'all' ? posts.value : posts.value.filter(p => p.tag === activeTag.value)
)

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

onMounted(async () => {
  const { data, error: err } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false })
  if (err) { error.value = true }
  else { posts.value = data }
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
</style>
