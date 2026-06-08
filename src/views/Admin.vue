<template>
  <div class="page">

    <!-- Login -->
    <div v-if="!session" class="login">
      <p class="section-title">sign in</p>
      <input v-model="email" type="email" placeholder="email" />
      <input v-model="password" type="password" placeholder="password" @keyup.enter="login" />
      <button @click="login" :disabled="signingIn">{{ signingIn ? 'signing in...' : 'sign in' }}</button>
      <p v-if="loginError" class="error">{{ loginError }}</p>
    </div>

    <!-- Admin panel -->
    <template v-else>
      <div class="admin-header">
        <span class="section-title">admin</span>
        <button class="signout" @click="signOut">sign out</button>
      </div>

      <div class="tabs">
        <button :class="{ active: tab === 'post' }" @click="tab = 'post'">new post</button>
        <button :class="{ active: tab === 'photo' }" @click="tab = 'photo'">new photo</button>
      </div>

      <!-- New post -->
      <form v-if="tab === 'post'" class="form" @submit.prevent="submitPost">
        <input v-model="post.title" type="text" placeholder="title" required />
        <input v-model="post.description" type="text" placeholder="description" required />
        <select v-model="post.tag" required>
          <option value="" disabled>tag</option>
          <option value="quant">quant</option>
          <option value="coding">coding</option>
          <option value="review">review</option>
        </select>
        <textarea v-model="post.body" placeholder="body" rows="6"></textarea>
        <input v-model="post.date" type="date" required />
        <button type="submit" :disabled="posting">{{ posting ? 'saving...' : 'save post' }}</button>
        <p v-if="postMsg" class="msg">{{ postMsg }}</p>
      </form>

      <!-- New photo -->
      <form v-if="tab === 'photo'" class="form" @submit.prevent="submitPhoto">
        <input v-model="photo.date" type="date" required />
        <input v-model="photo.caption" type="text" placeholder="caption (optional)" />
        <input ref="fileInput" type="file" accept="image/*" @change="onFile" required />
        <div v-if="duplicateWarning" class="duplicate">
          <p>a photo already exists for this date. replace it?</p>
          <div class="duplicate-actions">
            <button type="button" @click="confirmReplace">replace</button>
            <button type="button" class="cancel" @click="duplicateWarning = false">cancel</button>
          </div>
        </div>
        <button v-else type="submit" :disabled="uploading">{{ uploading ? 'uploading...' : 'save photo' }}</button>
        <p v-if="photoMsg" class="msg">{{ photoMsg }}</p>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const session = ref(null)
const email = ref('')
const password = ref('')
const signingIn = ref(false)
const loginError = ref('')
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session
  supabase.auth.onAuthStateChange((_, s) => { session.value = s })
})

async function login() {
  signingIn.value = true
  loginError.value = ''
  const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
  if (error) loginError.value = error.message
  signingIn.value = false
}

async function signOut() {
  await supabase.auth.signOut()
}

// Post form
const tab = ref('post')
const posting = ref(false)
const postMsg = ref('')
const post = ref({ title: '', description: '', tag: '', body: '', date: '' })

async function submitPost() {
  posting.value = true
  postMsg.value = ''
  const { error } = await supabase.from('posts').insert([{ ...post.value }])
  if (error) postMsg.value = `error: ${error.message}`
  else {
    postMsg.value = 'saved!'
    post.value = { title: '', description: '', tag: '', body: '', date: '' }
  }
  posting.value = false
}

// Photo form
const uploading = ref(false)
const photoMsg = ref('')
const photo = ref({ date: '', caption: '' })
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

  const { data } = await supabase.from('photos').select('id').eq('date', photo.value.date).single()
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
    resizeImage(photoFile.value, 200, 0.7),
  ])

  const fullPath = `${photo.value.date}-${ts}.jpg`
  const thumbPath = `${photo.value.date}-${ts}-thumb.jpg`

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
      caption: photo.value.caption,
    }).eq('id', existingPhoto.value.id))
  } else {
    ;({ error: dbErr } = await supabase.from('photos').insert([{
      date: photo.value.date,
      caption: photo.value.caption,
      url: urlData.publicUrl,
      thumb_url: thumbUrlData.publicUrl,
    }]))
  }

  if (dbErr) photoMsg.value = `db error: ${dbErr.message}`
  else {
    photoMsg.value = 'saved!'
    photo.value = { date: '', caption: '' }
    photoFile.value = null
    existingPhoto.value = null
    if (fileInput.value) fileInput.value.value = ''
  }
  uploading.value = false
}
</script>

<style scoped>
.page {
  width: var(--page-width);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.admin-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
}

.signout {
  font-size: 0.8rem;
  color: #aaa;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.signout:hover { color: #000; }

.login, .form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tabs button {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 0.95rem;
  color: #888;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
}

.tabs button.active { color: #000; text-decoration: underline; text-underline-offset: 4px; }

input, textarea, select {
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 0.5rem 0.65rem;
  width: 100%;
  outline: none;
  color: #000;
}

input:focus, textarea:focus, select:focus {
  border-color: rgba(0, 0, 0, 0.5);
}

textarea { resize: vertical; }

button[type="submit"], .login button {
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  align-self: flex-start;
}

button[type="submit"]:disabled, .login button:disabled {
  opacity: 0.5;
  cursor: default;
}

.msg { font-size: 0.85rem; color: #888; }
.error { font-size: 0.85rem; color: #c00; }

.duplicate {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.duplicate p {
  font-size: 0.85rem;
  color: #888;
}

.duplicate-actions {
  display: flex;
  gap: 0.5rem;
}

.duplicate-actions button {
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  background: #000;
  color: #fff;
}

.duplicate-actions button.cancel {
  background: #f0f0f0;
  color: #555;
}
</style>
