<template>
  <div class="page">
    <div class="tags">
      <span class="tags-label">tags:</span>
      <button
        v-for="tag in ['all', ...tags]"
        :key="tag"
        class="tag"
        :class="[tag, { active: activeTag === tag }]"
        @click="activeTag = tag"
      >{{ tag }}</button>
    </div>

    <div class="posts">
      <div v-for="post in filtered" :key="post.title" class="post">
        <div class="post-header">
          <span class="post-title">{{ post.title }}</span>
          <span class="post-date">{{ post.date }}</span>
          <span class="post-tag" :class="post.tag">{{ post.tag }}</span>
        </div>
        <p class="post-desc">{{ post.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tags = ['quant', 'coding', 'review']
const activeTag = ref('all')

const posts = [
  {
    title: 'Getting started with quantitative finance',
    date: 'May 2025',
    tag: 'quant',
    desc: 'A beginner-friendly look at the core concepts behind quant finance — pricing, risk, and why maths matters more than you think.',
  },
  {
    title: 'Building a REST API with Spring Boot',
    date: 'Mar 2025',
    tag: 'coding',
    desc: 'A walkthrough of setting up a clean, testable REST API in Spring Boot, with dependency injection and proper error handling.',
  },
  {
    title: 'Review: The Man from the Future (John von Neumann biography)',
    date: 'Jan 2025',
    tag: 'review',
    desc: 'Ananyo Bhattacharya\'s biography of von Neumann is a fascinating tour through one of the most remarkable minds of the 20th century.',
  },
  {
    title: 'Stochastic calculus: a gentle introduction',
    date: 'Nov 2024',
    tag: 'quant',
    desc: 'What is Brownian motion, and why does it show up everywhere in finance? A gentle introduction with as little pain as possible.',
  },
  {
    title: 'Why I switched from React to Vue',
    date: 'Sep 2024',
    tag: 'coding',
    desc: 'After years of React, I gave Vue a serious try. Here\'s what surprised me, what I miss, and what I\'ll never go back on.',
  },
]

const filtered = computed(() =>
  activeTag.value === 'all' ? posts : posts.filter(p => p.tag === activeTag.value)
)
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
}

.tag:hover {
  opacity: 0.75;
}

.tags-label {
  font-size: 0.85rem;
  color: #888;
  align-self: center;
}

.tag.all { background: #e8e8e8; color: #444; }
.tag.quant { background: #d4e8fb; color: #2a5f8a; }
.tag.coding { background: #d6f0e0; color: #2a6644; }
.tag.review { background: #f5dff5; color: #7a3d7a; }

.tag.active {
  border-color: currentColor;
  opacity: 1;
}

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

.post-title:hover {
  text-decoration-color: rgba(0, 0, 0, 0.7);
}

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
</style>
