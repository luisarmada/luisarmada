<template>
  <div class="page">
    <form v-if="session" class="admin-form" @submit.prevent="submitPhoto">
      <input v-model="newPhoto.date" type="date" required />
      <input v-model="newPhoto.caption" type="text" placeholder="caption (optional)" />
      <input ref="fileInput" type="file" accept="image/*" @change="onFile" required />
      <div v-if="duplicateWarning" class="duplicate">
        <p class="form-msg">a photo already exists for this date. replace it?</p>
        <div class="duplicate-actions">
          <button type="button" @click="confirmReplace">replace</button>
          <button type="button" class="cancel-btn" @click="duplicateWarning = false">cancel</button>
        </div>
      </div>
      <button v-else type="submit" :disabled="uploading">{{ uploading ? 'uploading...' : 'add photo' }}</button>
      <p v-if="photoMsg" class="form-msg">{{ photoMsg }}</p>
    </form>

    <div v-if="loading" class="muted">loading...</div>
    <template v-else>
      <div v-for="{ year, month } in months" :key="`${year}-${month}`" class="month-block">
        <p class="month-label">{{ label(year, month) }}</p>
        <div class="calendar">
          <div class="day-header" v-for="d in dayNames" :key="d">{{ d }}</div>
          <div
            v-for="(cell, i) in cells(year, month)"
            :key="i"
            class="cell"
            :class="{ empty: !cell, today: cell && isToday(cell), 'has-photo': cell && photoFor(cell) }"
            @click="cell && photoFor(cell) && open(photoFor(cell))"
          >
            <template v-if="cell">
              <span class="day-num">{{ cell.getDate() }}</span>
              <img v-if="photoFor(cell)" :src="photoFor(cell).thumb_url || photoFor(cell).url" class="thumb" loading="lazy" />
            </template>
          </div>
        </div>
      </div>
      <p v-if="months.length === 0" class="muted">no photos yet.</p>
    </template>

    <div class="lightbox" v-if="selected" @click.self="selected = null">
      <div class="lightbox-inner">
        <img :src="selected.url" loading="lazy" />
        <p class="lightbox-date">{{ formatDate(selected.date) }}</p>
        <p v-if="selected.caption" class="lightbox-caption">{{ selected.caption }}</p>
        <button class="close" @click="selected = null">✕</button>
        <button v-if="prevPhoto" class="nav-btn prev" @click="selected = prevPhoto">‹</button>
        <button v-if="nextPhoto" class="nav-btn next" @click="selected = nextPhoto">›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'
import { useAuth } from '../useAuth.js'

const today = new Date()
const todayStr = today.toDateString()
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const photos = ref([])
const loading = ref(true)
const selected = ref(null)

const { session } = useAuth()

const uploading = ref(false)
const photoMsg = ref('')
const newPhoto = ref({ date: '', caption: '' })
const photoFile = ref(null)
const fileInput = ref(null)
const duplicateWarning = ref(false)
const existingPhoto = ref(null)

function onFile(e) {
  photoFile.value = e.target.files[0]
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

async function submitPhoto() {
  if (!photoFile.value) return
  photoMsg.value = ''
  const { data } = await supabase.from('photos').select('id').eq('date', newPhoto.value.date).single()
  if (data) {
    existingPhoto.value = data
    duplicateWarning.value = true
    return
  }
  await uploadPhoto(false)
}

async function confirmReplace() {
  duplicateWarning.value = false
  await uploadPhoto(true)
}

async function uploadPhoto(replace) {
  uploading.value = true
  photoMsg.value = ''
  const ts = Date.now()
  const [full, thumb] = await Promise.all([
    resizeImage(photoFile.value, 1200, 0.85),
    resizeImage(photoFile.value, 800, 0.9),
  ])
  const fullPath = `${newPhoto.value.date}-${ts}.jpg`
  const thumbPath = `${newPhoto.value.date}-${ts}-thumb.jpg`
  const [fullUpload, thumbUpload] = await Promise.all([
    supabase.storage.from('photos').upload(fullPath, full, { upsert: true, contentType: 'image/jpeg' }),
    supabase.storage.from('photos').upload(thumbPath, thumb, { upsert: true, contentType: 'image/jpeg' }),
  ])
  if (fullUpload.error || thumbUpload.error) {
    photoMsg.value = `upload error: ${(fullUpload.error || thumbUpload.error).message}`
    uploading.value = false
    return
  }
  const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fullPath)
  const { data: thumbUrlData } = supabase.storage.from('photos').getPublicUrl(thumbPath)
  let dbErr
  if (replace && existingPhoto.value) {
    ;({ error: dbErr } = await supabase.from('photos').update({
      url: urlData.publicUrl,
      thumb_url: thumbUrlData.publicUrl,
      caption: newPhoto.value.caption,
    }).eq('id', existingPhoto.value.id))
  } else {
    ;({ error: dbErr } = await supabase.from('photos').insert([{
      date: newPhoto.value.date,
      caption: newPhoto.value.caption,
      url: urlData.publicUrl,
      thumb_url: thumbUrlData.publicUrl,
    }]))
  }
  if (dbErr) photoMsg.value = `db error: ${dbErr.message}`
  else {
    photoMsg.value = 'saved!'
    newPhoto.value = { date: '', caption: '' }
    photoFile.value = null
    existingPhoto.value = null
    if (fileInput.value) fileInput.value.value = ''
    await loadPhotos()
  }
  uploading.value = false
}

async function loadPhotos() {
  const { data } = await supabase
    .from('photos')
    .select('*')
    .order('date', { ascending: true })
  if (data) photos.value = data
}

onMounted(async () => {
  await loadPhotos()
  loading.value = false
})

// O(1) lookup map instead of .find() per cell per render
const photoMap = computed(() => {
  const map = {}
  for (const p of photos.value) map[p.date] = p
  return map
})

function photoFor(date) {
  return photoMap.value[key(date)] || null
}

function key(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const months = computed(() => {
  if (photos.value.length === 0) return [{ year: today.getFullYear(), month: today.getMonth() }]
  const first = new Date(photos.value[0].date)
  const result = []
  const cur = new Date(first.getFullYear(), first.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth(), 1)
  while (cur <= end) {
    result.push({ year: cur.getFullYear(), month: cur.getMonth() })
    cur.setMonth(cur.getMonth() + 1)
  }
  return result.reverse()
})

// precomputed per month, not recalculated on every render
const cellsMap = computed(() => {
  const map = {}
  for (const { year, month } of months.value) {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const offset = (first.getDay() + 6) % 7
    const days = []
    for (let i = 0; i < offset; i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
    while (days.length % 7 !== 0) days.push(null)
    map[`${year}-${month}`] = days
  }
  return map
})

function cells(year, month) {
  return cellsMap.value[`${year}-${month}`] || []
}

function label(year, month) {
  return new Date(year, month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isToday(date) {
  return date.toDateString() === todayStr
}

function open(photo) {
  selected.value = photo
}

const selectedIndex = computed(() =>
  photos.value.findIndex(p => p.id === selected.value?.id)
)

const prevPhoto = computed(() =>
  selectedIndex.value > 0 ? photos.value[selectedIndex.value - 1] : null
)

const nextPhoto = computed(() =>
  selectedIndex.value < photos.value.length - 1 ? photos.value[selectedIndex.value + 1] : null
)
</script>

<style scoped>
.page {
  width: var(--page-width);
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.month-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #888;
  margin-bottom: 0.5rem;
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-header {
  font-size: 0.7rem;
  color: #bbb;
  text-align: center;
  padding-bottom: 0.25rem;
  font-weight: 500;
}

.cell {
  aspect-ratio: 1;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.25rem;
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.cell.empty {
  background: transparent;
  border-color: transparent;
}

.cell.today {
  border-color: rgba(0, 0, 0, 0.35);
}

.cell.has-photo {
  cursor: pointer;
  border-color: transparent;
}

.cell.has-photo:hover {
  border-color: rgba(0, 0, 0, 0.5);
}


.day-num {
  font-size: 0.65rem;
  color: #ccc;
  font-weight: 500;
  line-height: 1;
  z-index: 1;
}

.cell.today .day-num {
  color: #000;
}

.thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.lightbox-inner {
  background: #fff;
  border-radius: 6px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: min(90vw, 32rem);
  position: relative;
}

.lightbox-inner img {
  width: 100%;
  border-radius: 4px;
}

.lightbox-date {
  font-size: 0.8rem;
  color: #aaa;
  text-align: center;
}

.lightbox-caption {
  font-size: 0.85rem;
  color: #555;
  text-align: center;
  line-height: 1.5;
}

.close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #888;
  font-family: inherit;
}

.close:hover { color: #000; }

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
  font-family: inherit;
  padding: 0 0.25rem;
  line-height: 1;
}

.nav-btn:hover { color: #000; }
.nav-btn.prev { left: -1.5rem; }
.nav-btn.next { right: -1.5rem; }

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

.admin-form input {
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

.admin-form input:focus { border-color: rgba(0, 0, 0, 0.4); }

.admin-form button[type="submit"],
.duplicate-actions button {
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

.duplicate { display: flex; flex-direction: column; gap: 0.5rem; }

.duplicate-actions {
  display: flex;
  gap: 0.5rem;
}

.duplicate-actions button { align-self: unset; }

.cancel-btn {
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  background: #f0f0f0 !important;
  color: #555 !important;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
}

.form-msg { font-size: 0.8rem; color: #888; }
</style>
