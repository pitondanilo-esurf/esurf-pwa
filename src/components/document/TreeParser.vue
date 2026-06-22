<template>
  <div class="fintech-parser-container">
    <header class="parser-header">
      <h2>Documentazione Architetturale e-Surf</h2>
      <p>Mappa di navigazione gerarchica della piattaforma.</p>
    </header>

    <div style="background: #ef4444; color: white; padding: 4px 8px; font-size: 12px; margin-bottom: 10px; border-radius: 4px;">
      DEBUG: Nodi caricati in memoria: {{ treeData.length }}
    </div>

    <div v-if="treeData.length > 0" class="tree-viewport">
      <div class="tree-actions">
        <button @click="toggleAll(true)" class="btn-tree-action">Espandi Tutto</button>
        <button @click="toggleAll(false)" class="btn-tree-action">Contrai Tutto</button>
      </div>
      
      <div class="tree-root">
        <TreeNode 
          v-for="(node, index) in treeData" 
          :key="index" 
          :node="node" 
          :default-expanded="allExpanded"
        />
      </div>
    </div>
    <div v-else class="text-muted text-center mt-4">
      In attesa dei dati... Se vedi questo messaggio a lungo, l'array è vuoto.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import TreeNode from './TreeNode.vue'
import strutturaText from './struttura.txt?raw'

const treeData = ref([])
const allExpanded = ref(true)

// --- 1. MONITORAGGIO VARIABILE ---
watch(treeData, (newVal, oldVal) => {
  console.log(`[DEBUG WATCHER] treeData è cambiato! Da ${oldVal.length} nodi a ${newVal.length} nodi.`);
  if (newVal.length === 0 && oldVal.length > 0) {
    console.error("🚨 ALLARME: Qualcosa ha appena SVUOTATO l'array treeData!");
  }
})

// --- 2. CICLO DI VITA ---
onMounted(() => {
  console.log("[DEBUG 1] Componente Montato correttamente.");
  
  if (strutturaText) {
    console.log(`[DEBUG 2] Testo caricato con successo. Lunghezza: ${strutturaText.length} caratteri.`);
    console.log(`[DEBUG 2.1] Anteprima testo:`, strutturaText.substring(0, 50) + "...");
    processText(strutturaText)
  } else {
    console.error("🚨 [DEBUG 2] strutturaText è undefined o vuoto!");
  }
})

// --- 3. LOGICA DI PARSING ---
const parseTabTextToTree = (text) => {
  console.log("[DEBUG 3] Avvio parser testo...");
  const lines = text.split(/\r?\n/)
  console.log(`[DEBUG 4] Righe totali trovate: ${lines.length}`);
  
  const root = { children: [] }
  const stack = [root]

  lines.forEach((line, index) => {
    if (!line.trim()) return

    const tabMatch = line.match(/^(\t*)/)
    const depth = tabMatch ? tabMatch[0].length : 0
    const content = line.trim()

    const newNode = {
      label: content,
      children: [],
      id: Math.random().toString(36).substr(2, 9)
    }

    while (stack.length > depth + 1) {
      stack.pop()
    }

    if(stack.length > 0 && stack[stack.length - 1]) {
        stack[stack.length - 1].children.push(newNode)
        stack.push(newNode)
    }
  })

  console.log(`[DEBUG 5] Parser completato. Nodi principali (radice): ${root.children.length}`);
  return root.children
}

const processText = (text) => {
  const result = parseTabTextToTree(text);
  treeData.value = result;
  console.log("[DEBUG 6] treeData popolato correttamente e inviato al template.");
}

const toggleAll = (state) => {
  allExpanded.value = state
}
</script>

<style scoped>
.fintech-parser-container {
  --bg-app: #0f172a;
  --bg-card: #1e293b;
  --border-color: #334155;
  --accent-cyan: #0ea5e9;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  
  background-color: var(--bg-app);
  color: var(--text-main);
  padding: 2rem;
  border-radius: 16px;
  min-height: 500px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.parser-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-main);
}

.parser-header p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.tree-viewport {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  /* Rimossa l'animazione di fade-in per sicurezza */
}

.tree-actions {
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.btn-tree-action {
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s ease;
}

.btn-tree-action:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}
</style>