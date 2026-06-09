<template>
  <div class="container">
    <div class="content">
      <RouterLink to="/" class="name"><span class="panda">🐼</span>&nbsp;luis armada&nbsp;<span class="panda-placeholder">🐼</span></RouterLink>
      <hr />
      <nav>
        <RouterLink v-for="item in nav" :key="item" :to="'/' + item">{{ item }}</RouterLink>
        <button v-if="session" class="signout" @click="signOut">sign out</button>
      </nav>
      <hr />
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { useAuth } from './useAuth.js'
import { supabase } from './supabase.js'

const nav = ['profile', 'projects', 'posts', 'photos', 'plus']
const { session } = useAuth()

function signOut() {
  supabase.auth.signOut()
}
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: var(--page-width);
}

.name {
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  color: #000;
}

.panda-placeholder {
  opacity: 0;
  visibility: hidden;
}

.panda {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.name:hover .panda {
  opacity: 1;
}

hr {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.35);
  width: var(--page-width);
}

nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  color: #888;
  cursor: pointer;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
}

nav a.router-link-exact-active {
  color: #000;
}

nav a:not(.router-link-exact-active):hover {
  color: #111;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.35);
  text-underline-offset: 5px;
}

.signout {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 500;
  color: #bbb;
  cursor: pointer;
  padding: 0;
}

.signout:hover { color: #000; }
</style>
