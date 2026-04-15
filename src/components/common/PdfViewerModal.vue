<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="closeModal">
      <div class="glass-modal pdf-modal fade-in-up">
        
        <div class="modal-header">
          <h3>Documento Originale</h3>
          <div class="header-actions">
            <a v-if="url" :href="url" target="_blank" download class="btn-download" title="Scarica PDF">
               ⬇️ Scarica
            </a>
            <button @click="closeModal" class="btn-close-modal" title="Chiudi">✕</button>
          </div>
        </div>

        <div class="modal-body">
          <iframe 
              v-if="url" 
              :src="url" 
              class="pdf-iframe"
              title="Visualizzatore PDF"
          ></iframe>
          
          <div v-else class="empty-pdf">
             <div class="spinner"></div>
             <p>Caricamento documento in corso...</p>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

// --- CHICCA UX: Chiudere la modale col tasto ESC ---
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* SFONDO SCURO */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Z-index altissimo per stare sopra a tutto */
}

/* MODALE A TUTTO SCHERMO */
.pdf-modal {
  background: var(--bg-card, #ffffff);
  width: 95vw !important;
  max-width: 1400px !important;
  height: 92vh !important;
  max-height: 95vh !important;
  border-radius: 12px;
  display: flex !important;
  flex-direction: column !important;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  overflow: hidden;
}

/* HEADER */
.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-app, #f8fafc);
  color: var(--text-main, #1e293b);
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-download {
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-blue, #3b82f6);
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.1);
  transition: all 0.2s;
}

.btn-download:hover {
  background: rgba(59, 130, 246, 0.2);
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted, #64748b);
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal:hover {
  color: #ef4444; /* Rosso al passaggio del mouse */
  transform: scale(1.1);
}

/* BODY E IFRAME */
.modal-body {
  flex: 1 !important;
  padding: 0 !important;
  background: #525659; /* Colore classico di sfondo dei visualizzatori PDF */
  position: relative;
  overflow: hidden !important;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* STATO DI CARICAMENTO */
.empty-pdf {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 600;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

/* ANIMAZIONI */
@keyframes spin { 
  0% { transform: rotate(0deg); } 
  100% { transform: rotate(360deg); } 
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.fade-in-up {
  animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>