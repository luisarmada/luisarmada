<template>
  <div class="page">
    <div class="projects">
      <div v-for="project in projects" :key="project.title" class="project">
        <div class="project-header">
          <span class="project-title">{{ project.title }}</span>
          <span class="project-date">{{ project.date }}</span>
        </div>
        <p class="project-desc">{{ project.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const projects = [
  {
    title: 'Portfolio Website',
    date: 'Jun 2025',
    desc: 'A personal portfolio built with Vue 3 and Vite. Minimal design with fast load times and smooth navigation.',
  },
  {
    title: 'Algorithmic Trading Bot',
    date: 'Mar 2025',
    desc: 'A Python-based trading bot implementing mean-reversion and momentum strategies, backtested on historical equity data.',
  },
  {
    title: 'REST API with Spring Boot',
    date: 'Jan 2025',
    desc: 'A clean, testable REST API built in Spring Boot with JWT authentication, role-based access control, and PostgreSQL.',
  },
  {
    title: 'Options Pricing Library',
    date: 'Oct 2024',
    desc: 'A Java library implementing Black-Scholes and binomial tree models for pricing European and American options.',
  },
  {
    title: 'CLI Task Manager',
    date: 'Jul 2024',
    desc: 'A terminal-based task manager written in Go with local JSON persistence, priority sorting, and due date tracking.',
  },
]
</script>

<style scoped>
.page {
  width: var(--page-width);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.projects {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
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
  cursor: pointer;
}

.project-title:hover {
  text-decoration-color: rgba(0, 0, 0, 0.7);
}

.project-date {
  font-size: 0.85rem;
  color: #888;
}

.project-desc {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #999;
  line-height: 1.5;
}
</style>
