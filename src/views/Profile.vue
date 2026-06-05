<template>
  <div class="page">
    <section>
      <h2>experience</h2>
      <ul>
        <li>
          <span class="toggle" @click="fvc = !fvc">Future Value Consultants</span>
          <span class="muted"> (2025 – present)</span>
          <div v-if="fvc" class="dropdown">
            <p>Quantitative developer role. More details here.</p>
          </div>
        </li>
        <li>
          <span class="toggle" @click="ibm = !ibm">IBM</span>
          <span class="muted"> (summer 2023)</span>
          <div v-if="ibm" class="dropdown">
            <p>Summer internship. More details here.</p>
          </div>
        </li>
      </ul>
    </section>

    <section>
      <h2>education</h2>
      <ul>
        <li>
          <span class="toggle" @click="warwick = !warwick">University of Warwick</span>
          <span class="muted"> (2022 – 2025)</span>: BSc Computer Science
          <div v-if="warwick" class="dropdown">
            <p>More details here.</p>
          </div>
        </li>
      </ul>
    </section>

    <section>
      <h2>tech stack</h2>
      <ul>
        <li><span class="label">Programming Languages:</span> C++, Java, Python</li>
        <li><span class="label">Frameworks & Libraries:</span> Flask, Django, Spring Boot, React, Express.js, Angular</li>
        <li><span class="label">Technologies:</span> Databases (PostgreSQL, MySQL, MongoDB), Operating Systems (Linux), Version Control (Git), CI/CD (Jenkins, GitHub Actions), Testing (JUnit, Mockito), Cloud Services (AWS)</li>
      </ul>
    </section>

    <section>
      <h2>languages</h2>
      <ul>
        <li>English <span class="muted">(fluent)</span></li>
        <li>Japanese <span class="muted">(intermediate)</span></li>
        <li>Tagalog <span class="muted">(intermediate)</span></li>
      </ul>
    </section>

    <p class="cv-note">If you'd prefer this in CV form, you can find it <a href="https://docs.google.com/document/d/e/2PACX-1vSMyGivKigsNBcjwSALv2460kfRaZOjTw1SXvjvhXqwxGx4ai23Eyr0CEADYuqPvV9y388r_uqQX1xh/pub" target="_blank" rel="noopener">here</a>.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fvc = ref(false)
const ibm = ref(false)
const warwick = ref(false)
</script>

<style scoped>
.page {
  width: var(--page-width);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  color: #000;
}

ul {
  list-style: none;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

li {
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
}

li::before {
  content: '▸';
  margin-right: 0.6rem;
  margin-left: -1.1rem;
  color: #000;
  font-size: 0.7rem;
  vertical-align: middle;
  position: relative;
  top: -3px;
}

.toggle {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.35);
  text-underline-offset: 5px;
  font-weight: 500;
}

.toggle:hover {
  text-decoration-color: rgba(0, 0, 0, 0.7);
}

.dropdown {
  margin-top: 0.4rem;
  margin-left: 0.1rem;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid rgba(0, 0, 0, 0.15);
  color: #555;
  font-size: 0.95rem;
}

.dropdown p {
  margin: 0;
  line-height: 1.6;
}

.muted {
  color: #888;
}

.label {
  font-weight: 600;
}

.cv-note {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
}

.cv-note a {
  color: #000;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.35);
  text-underline-offset: 5px;
}

.cv-note a:hover {
  text-decoration-color: rgba(0, 0, 0, 0.7);
}
</style>
