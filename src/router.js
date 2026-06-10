import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Profile from './views/Profile.vue'
import Projects from './views/Projects.vue'
import Posts from './views/Posts.vue'
import Photos from './views/Photos.vue'
import Admin from './views/Admin.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/profile', component: Profile },
    { path: '/projects', component: Projects },
    { path: '/posts', component: Posts },
    { path: '/photos', component: Photos },
    { path: '/admin', component: Admin },
  ],
})
