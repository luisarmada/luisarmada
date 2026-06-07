<template>
  <div class="page">
    <div class="tags">
      <span class="tags-label">tags:</span>
      <button
        v-for="tag in ['all', 'guitar', 'climbing']"
        :key="tag"
        class="tag"
        :class="[tag, { active: activeTag === tag }]"
        @click="activeTag = tag"
      >{{ tag }}</button>
    </div>

    <div class="grid">
      <div v-for="item in filtered" :key="item.shortcode" class="reel-card">
        <a :href="`https://www.instagram.com/reel/${item.shortcode}/`" target="_blank" class="reel-cover">
          <iframe
            :src="`https://www.instagram.com/reel/${item.shortcode}/embed/captioned/`"
            frameborder="0"
            scrolling="no"
            allowtransparency
            allowfullscreen
          ></iframe>
          <div class="mask-bottom"></div>
        </a>
        <div class="reel-footer">
          <span class="reel-title">{{ item.title }}</span>
          <div class="reel-meta">
            <span class="reel-date">{{ item.date }}</span>
            <span class="reel-tag" :class="item.tag">{{ item.tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeTag = ref('all')

const reels = [
  {
    shortcode: 'DWhIavqjDfk',
    title: 'fingerstyle cover',
    date: 'Jun 2025',
    tag: 'guitar',
  },
  {
    shortcode: 'DWwh29bDKYE',
    title: 'outdoor bouldering session',
    date: 'Jun 2025',
    tag: 'climbing',
  },
]

const filtered = computed(() =>
  activeTag.value === 'all' ? reels : reels.filter(r => r.tag === activeTag.value)
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

.tags-label {
  font-size: 0.85rem;
  color: #888;
  align-self: center;
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

.tag.all      { background: #e8e8e8; color: #444; }
.tag.guitar   { background: #fde8d4; color: #8a4a2a; }
.tag.climbing { background: #d6f0e0; color: #2a6644; }

.tag.active {
  border-color: currentColor;
  opacity: 1;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.reel-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reel-cover {
  display: block;
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
}

.reel-cover iframe {
  position: absolute;
  top: -54px;
  left: -22.5%;
  width: 145%;
  height: calc(100% + 54px);
  border: none;
  pointer-events: none;
}

.mask-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 0px;
  background: #fff;
  z-index: 1;
  pointer-events: none;
}


.reel-footer {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 4px;
  position: relative;
  z-index: 2;
}

.reel-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reel-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #222;
}

.reel-date {
  font-size: 0.8rem;
  color: #aaa;
}

.reel-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
}

.reel-tag.guitar   { background: #fde8d4; color: #8a4a2a; }
.reel-tag.climbing { background: #d6f0e0; color: #2a6644; }
</style>
