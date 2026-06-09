<template>
  <div class="page">
    <div v-if="!session" class="login">
      <input v-model="email" type="email" placeholder="email" />
      <input v-model="password" type="password" placeholder="password" @keyup.enter="login" />
      <button @click="login" :disabled="signingIn">{{ signingIn ? 'signing in...' : 'sign in' }}</button>
      <p v-if="loginError" class="error">{{ loginError }}</p>
    </div>
    <p v-else class="muted">signed in. <RouterLink to="/">go home</RouterLink></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../useAuth.js'
import { supabase } from '../supabase.js'

const { session } = useAuth()
const email = ref('')
const password = ref('')
const signingIn = ref(false)
const loginError = ref('')

async function login() {
  signingIn.value = true
  loginError.value = ''
  const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
  if (error) loginError.value = error.message
  signingIn.value = false
}
</script>

<style scoped>
.page {
  width: var(--page-width);
}

.login {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

input {
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 0.5rem 0.65rem;
  width: 100%;
  outline: none;
  color: #000;
  box-sizing: border-box;
}

input:focus { border-color: rgba(0, 0, 0, 0.5); }

button {
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

button:disabled { opacity: 0.5; cursor: default; }

.error { font-size: 0.85rem; color: #c00; }
.muted { font-size: 0.9rem; color: #aaa; }
.muted a { color: #000; }
</style>
