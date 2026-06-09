<template>
  <div class="editor" @click="openId = null">
    <div v-for="tag in tags" :key="tag.id" class="row">
      <div class="swatch-wrap" @click.stop>
        <button
          class="swatch"
          :style="{ background: drafts[tag.id]?.color || tag.color }"
          @click="toggle(tag.id)"
        ></button>
        <div v-if="openId === tag.id" class="palette">
          <button
            v-for="c in PALETTE"
            :key="c"
            class="pal"
            :class="{ sel: drafts[tag.id]?.color === c }"
            :style="{ background: c }"
            @click="pick(tag.id, c)"
          ></button>
        </div>
      </div>
      <input
        v-if="drafts[tag.id]"
        v-model="drafts[tag.id].name"
        class="name-input"
        @keyup.enter="save(tag)"
      />
      <button class="btn" @click="save(tag)" :disabled="busy === tag.id">save</button>
      <button
        class="btn del"
        @click="del(tag)"
        :disabled="(tagUsage[tag.name] || 0) > 0"
        :title="(tagUsage[tag.name] || 0) > 0 ? `used by ${tagUsage[tag.name]} item(s) — cannot delete` : 'delete'"
      >del</button>
    </div>

    <div class="row" @click.stop>
      <div class="swatch-wrap">
        <button
          class="swatch"
          :style="{ background: newColor }"
          @click.stop="toggle('__new__')"
        ></button>
        <div v-if="openId === '__new__'" class="palette">
          <button
            v-for="c in PALETTE"
            :key="c"
            class="pal"
            :class="{ sel: newColor === c }"
            :style="{ background: c }"
            @click="newColor = c; openId = null"
          ></button>
        </div>
      </div>
      <input v-model="newName" class="name-input" placeholder="new tag" @keyup.enter="add" />
      <button class="btn add" @click="add" :disabled="adding">add</button>
    </div>

    <p v-if="msg" class="msg">{{ msg }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  tags: Array,
  tagUsage: Object,
  addTag: Function,
  updateTag: Function,
  deleteTag: Function,
})

const PALETTE = [
  '#2a5f8a', '#2a6644', '#7a3d7a',
  '#8a2a2a', '#7a5020', '#6b6b1a',
  '#1a7a6a', '#8a306a', '#3a3a8a',
  '#5a6a2a', '#3a5a6a', '#6a3a2a',
  '#4a2a6a', '#1f7a7a', '#7a4a1a',
]

const drafts = ref({})
const openId = ref(null)
const busy = ref(null)
const adding = ref(false)
const msg = ref('')
const newName = ref('')
const newColor = ref(PALETTE[0])

watch(() => props.tags, (next) => {
  const d = {}
  for (const tag of next) {
    d[tag.id] = drafts.value[tag.id] ?? { name: tag.name, color: tag.color }
  }
  drafts.value = d
}, { immediate: true })

function toggle(id) {
  openId.value = openId.value === id ? null : id
}

function pick(tagId, color) {
  drafts.value[tagId].color = color
  openId.value = null
}

async function save(tag) {
  const d = drafts.value[tag.id]
  if (!d?.name.trim()) return
  busy.value = tag.id
  msg.value = ''
  const { error } = await props.updateTag(tag.id, d.name, d.color)
  if (error) msg.value = error.message
  busy.value = null
}

async function del(tag) {
  msg.value = ''
  const { error } = await props.deleteTag(tag.id)
  if (error) msg.value = error.message
}

async function add() {
  if (!newName.value.trim()) return
  adding.value = true
  msg.value = ''
  const { error } = await props.addTag(newName.value, newColor.value)
  if (error) msg.value = error.message
  else {
    newName.value = ''
    newColor.value = PALETTE[0]
  }
  adding.value = false
}
</script>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.85rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: #fafafa;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.swatch-wrap {
  position: relative;
  flex-shrink: 0;
}

.swatch {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: block;
  padding: 0;
}

.palette {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(5, 1.25rem);
  gap: 4px;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pal {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 0;
}

.pal.sel {
  outline: 2px solid #000;
  outline-offset: 1px;
}

.pal:hover { opacity: 0.75; }

.name-input {
  flex: 1;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 0.3rem 0.55rem;
  outline: none;
  color: #000;
  background: #fff;
  min-width: 0;
}

.name-input:focus { border-color: rgba(0, 0, 0, 0.4); }

.btn {
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.65rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn:disabled { opacity: 0.35; cursor: default; }
.btn:not(:disabled):hover { opacity: 0.8; }

.btn.del {
  background: transparent;
  color: #999;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.btn.del:not(:disabled):hover { color: #c00; border-color: #c00; }

.msg {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
}
</style>
