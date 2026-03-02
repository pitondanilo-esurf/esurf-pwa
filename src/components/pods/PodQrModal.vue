<template>
  <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
          <div class="glass-modal qr-modal">
              <div class="modal-header">
                  <div class="header-title">
                      <h3>{{ $t('pods.qrModal.title') }}</h3>
                      <span class="subtitle-pod">{{ pod?.pod_code }}</span>
                  </div>
                  <button @click="$emit('close')" class="btn-close-modal">✕</button>
              </div>
              
              <div class="modal-body qr-body">
                  <p class="qr-instruction">{{ $t('pods.qrModal.instruction') }}</p>
                  
                  <div class="qr-code-wrapper">
                      <qrcode-vue :value="qrUrl" :size="220" level="H" render-as="svg" />
                  </div>

                  <div class="qr-link-box mt-3">
                      <label>{{ $t('pods.qrModal.linkLabel') }}</label>
                      <input 
                          type="text" 
                          :value="qrUrl" 
                          readonly 
                          class="compact-input" 
                          @click="copyToClipboard($event)" 
                          :title="$t('pods.qrModal.copyTooltip')"
                      >
                  </div>
              </div>
          </div>
      </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import QrcodeVue from 'qrcode.vue';

const props = defineProps({
  show: Boolean,
  pod: Object,
  qrUrl: String
});

defineEmits(['close']);
const { t } = useI18n();

const copyToClipboard = (event) => {
    event.target.select();
    navigator.clipboard.writeText(props.qrUrl);
    // Mostra un piccolo alert tradotto per confermare la copia
    alert(t('pods.qrModal.copiedAlert') || "Link copiato negli appunti!");
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 400px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }
.header-title { display: flex; flex-direction: column; }
.header-title h3 { margin: 0; font-size: 1.1rem; }
.subtitle-pod { font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; font-family: monospace; margin-top: 2px; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; color: var(--text-main); }

.qr-instruction { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.4; }

.qr-code-wrapper {
    background: #ffffff; /* FONDAMENTALE PER LA LETTURA */
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    display: inline-block;
}

.qr-link-box { width: 100%; text-align: left; }
.qr-link-box label { font-size: 0.7rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 4px; display: block; }
.compact-input { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.75rem; background: var(--bg-app); color: var(--text-main); font-family: monospace; cursor: pointer; }
.compact-input:focus { border-color: var(--accent-blue); outline: none; }
.mt-3 { margin-top: 1.5rem; }
</style>