<template>
  <div class="tree-node" :class="{ 'has-children': hasChildren }">
    <div class="node-wrapper" @click="toggleExpand" :style="{ paddingLeft: depth * 4 + 'px' }">
      <span v-if="hasChildren" class="toggle-icon" :class="{ 'is-expanded': isExpanded }">
        ▶
      </span>
      <span v-else class="leaf-icon">◽</span>
      
      <span class="node-label" :class="{ 'is-path': isPath(node.label) }">
        {{ node.label }}
      </span>
    </div>

    <div v-if="hasChildren && isExpanded" class="node-children">
      <TreeNode 
        v-for="(childNode, index) in node.children" 
        :key="childNode.id || index" 
        :node="childNode" 
        :depth="depth + 1"
        :default-expanded="defaultExpanded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  defaultExpanded: {
    type: Boolean,
    default: true
  }
})

const isExpanded = ref(props.defaultExpanded)

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

const toggleExpand = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value
  }
}

// Rileva se la stringa rappresenta un percorso file o un URL per applicare uno stile differente
const isPath = (label) => {
  return label.includes('/') || label.includes('@/') || label.includes('.vue')
}

// Sincronizza lo stato di espansione con i controlli globali del padre
watch(() => props.defaultExpanded, (newVal) => {
  isExpanded.value = newVal
})
</script>

<style scoped>
.tree-node {
  display: flex;
  flex-direction: column;
}

.node-wrapper {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
  font-size: 0.9rem;
}

.node-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.toggle-icon {
  font-size: 0.65rem;
  margin-right: 8px;
  color: #64748b;
  transition: transform 0.2s ease;
  display: inline-block;
}

.toggle-icon.is-expanded {
  transform: rotate(90deg);
  color: #0ea5e9;
}

.leaf-icon {
  font-size: 0.7rem;
  margin-right: 8px;
  color: #475569;
}

.node-label {
  color: #cbd5e1;
  white-space: pre-wrap;
  word-break: break-all;
}

.node-label.is-path {
  color: #38bdf8;
  font-weight: 600;
}

.node-children {
  border-left: 1px dashed #334155;
  margin-left: 14px;
  padding-left: 6px;
}
</style>