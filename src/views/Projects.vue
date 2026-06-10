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

    <form v-if="session" class="admin-form" @submit.prevent="submitProject">
      <input v-model="newProject.title" type="text" placeholder="title" required />
      <input v-model="newProject.description" type="text" placeholder="description" required />
      <input v-model="newProject.link" type="url" placeholder="link" required />
      <select v-model="newProject.tag" required>
        <option value="" disabled>tag</option>
        <option v-for="t in tags" :key="t.id" :value="t.name">{{ t.name }}</option>
      </select>
      <input v-model="newProject.date" type="date" required />
      <input ref="projectFileInput" type="file" accept="image/*" @change="onProjectFile" />
      <button type="submit" :disabled="projectUploading">{{ projectUploading ? 'saving...' : 'add project' }}</button>
      <p v-if="projectMsg" class="form-msg">{{ projectMsg }}</p>
    </form>

    <div v-if="loading" class="muted">loading...</div>
    <div v-else-if="error" class="muted">failed to load projects.</div>
    <div v-else class="projects">
      <div v-for="project in filtered" :key="project.id" class="project-wrap">
        <template v-if="editId === project.id">
          <form class="inline-edit" @submit.prevent="saveProject(project)">
            <input v-model="editDraft.title" type="text" required />
            <input v-model="editDraft.description" type="text" required />
            <input v-model="editDraft.link" type="url" required />
            <select v-model="editDraft.tag" required>
              <option value="" disabled>tag</option>
              <option v-for="t in tags" :key="t.id" :value="t.name">{{ t.name }}</option>
            </select>
            <input v-model="editDraft.date" type="date" required />
            <div class="inline-edit-actions">
              <button type="submit" :disabled="saving">{{ saving ? 'saving...' : 'save' }}</button>
              <button type="button" class="cancel-btn" @click="editId = null">cancel</button>
              <button type="button" class="delete-btn" @click="deleteProject(project.id)">delete</button>
            </div>
            <p v-if="editMsg" class="form-msg">{{ editMsg }}</p>
          </form>
        </template>
        <template v-else>
          <a class="project" :href="project.link" target="_blank" rel="noopener">
            <img v-if="project.image_url" :src="project.image_url" class="project-img" />
            <div class="project-body">
              <div class="project-header">
                <span class="project-title">{{ project.title }}</span>
                <span class="project-date">{{ formatDate(project.date) }}</span>
                <span class="project-tag" :style="tagStyle(project.tag)">{{ project.tag }}</span>
                <button v-if="session" class="edit-btn" @click.prevent="startEdit(project)">edit</button>
              </div>
              <p class="project-desc">{{ project.description }}</p>
            </div>
          </a>
        </template>
      </div>
      <p v-if="filtered.length === 0" class="muted">no projects yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../supabase.js'
import { useTags } from '../useTags.js'
import { useAuth } from '../useAuth.js'
import TagsEditor from '../components/TagsEditor.vue'

const projects = ref([])
const loading = ref(true)
const error = ref(false)
const activeTag = ref('all')
const editingTags = ref(false)

const { session } = useAuth()
const { tags, tagUsage, loadUsage, addTag, updateTag, deleteTag } = useTags('projects', 'projects')
const availableTags = computed(() => tags.value.map(t => ({ name: t.name, color: t.color })))

watch(editingTags, v => { if (v) loadUsage() })

const filtered = computed(() =>
  activeTag.value === 'all' ? projects.value : projects.value.filter(p => p.tag === activeTag.value)
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

function startEdit(project) {
  editId.value = project.id
  editDraft.value = { title: project.title, description: project.description, link: project.link, tag: project.tag, date: project.date }
  editMsg.value = ''
}

async function saveProject(project) {
  saving.value = true
  editMsg.value = ''
  const { error } = await supabase.from('projects').update({ ...editDraft.value }).eq('id', project.id)
  if (error) editMsg.value = error.message
  else {
    editId.value = null
    await loadProjects()
  }
  saving.value = false
}

async function deleteProject(id) {
  if (!confirm('delete this project?')) return
  await supabase.from('projects').delete().eq('id', id)
  editId.value = null
  await loadProjects()
}

const projectUploading = ref(false)
const projectMsg = ref('')
const newProject = ref({ title: '', description: '', link: '', tag: '', date: '' })
const projectFile = ref(null)
const projectFileInput = ref(null)

function onProjectFile(e) {
  projectFile.value = e.target.files[0]
}

function resizeImage(file, maxWidth, quality) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    img.src = url
  })
}

async function submitProject() {
  projectUploading.value = true
  projectMsg.value = ''
  let image_url = null
  if (projectFile.value) {
    const compressed = await resizeImage(projectFile.value, 400, 0.9)
    const path = `projects/${newProject.value.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`
    const { error: uploadErr } = await supabase.storage
      .from('photos')
      .upload(path, compressed, { upsert: true, contentType: 'image/jpeg' })
    if (uploadErr) {
      projectMsg.value = `upload error: ${uploadErr.message}`
      projectUploading.value = false
      return
    }
    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
    image_url = urlData.publicUrl
  }
  const { error: dbErr } = await supabase.from('projects').insert([{ ...newProject.value, image_url }])
  if (dbErr) projectMsg.value = `db error: ${dbErr.message}`
  else {
    projectMsg.value = 'saved!'
    newProject.value = { title: '', description: '', link: '', tag: '', date: '' }
    projectFile.value = null
    if (projectFileInput.value) projectFileInput.value.value = ''
    await loadProjects()
  }
  projectUploading.value = false
}

async function loadProjects() {
  const { data, error: err } = await supabase
    .from('projects')
    .select('*')
    .order('date', { ascending: false })
  if (err) error.value = true
  else projects.value = data
}

onMounted(async () => {
  await loadProjects()
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
.tags-label { font-size: 0.85rem; color: #888; }

.tag.all { background: #e8e8e8; color: #444; }
.tag.quant { background: #d4e8fb; color: #2a5f8a; }
.tag.coding { background: #d6f0e0; color: #2a6644; }
.tag.web { background: #f5dff5; color: #7a3d7a; }
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

.projects {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  text-decoration: none;
  color: inherit;
}

.project:hover .project-title {
  text-decoration-color: rgba(0, 0, 0, 0.7);
}

.project-img {
  width: 4rem;
  height: 4rem;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.project-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.project-title {
  font-size: 1rem;
  font-weight: 500;
  color: #000;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.35);
  text-underline-offset: 5px;
}

.project-date {
  font-size: 0.85rem;
  color: #888;
}

.project-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  position: relative;
  top: -2px;
}

.project-tag.quant { background: #d4e8fb; color: #2a5f8a; }
.project-tag.coding { background: #d6f0e0; color: #2a6644; }
.project-tag.web { background: #f5dff5; color: #7a3d7a; }

.project-desc {
  font-size: 0.85rem;
  color: #999;
  line-height: 1.5;
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

.project-wrap { display: contents; }

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
.inline-edit select {
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
.inline-edit select:focus { border-color: rgba(0, 0, 0, 0.4); }

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
