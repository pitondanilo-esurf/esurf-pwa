<template>
  <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop">
          <div class="glass-modal sign-modal">
              <div class="modal-header">
                  <h3>{{ $t('pods.signModal.title') }}</h3>
                  <button @click="$emit('close')" class="btn-close-modal">✕</button>
              </div>
              <div class="modal-body">
                   <p class="modal-intro">{{ $t('pods.signModal.signFor') }} <b>{{ signingPod?.pod_code }}</b>.</p>
                   
                   <div class="modal-tabs">
                      <button @click="$emit('switchTab', 'delegation_pod_read')" :class="{active: currentDocType==='delegation_pod_read'}">{{ $t('pods.actions.delegation') }}</button>
                      <button @click="$emit('switchTab', 'data_usage_policy')" :class="{active: currentDocType==='data_usage_policy'}">{{ $t('pods.actions.policy') }}</button>
                   </div>
                   
                   <div class="doc-preview-container" v-html="previewHtml || $t('pods.status.loading')"></div>
                   
                   <div class="checks-container mt-3">
                       <label><input type="checkbox" v-model="signForm.accept_delegation"> {{ $t('pods.signModal.acceptDel') }}</label>
                       <label><input type="checkbox" v-model="signForm.accept_data_policy"> {{ $t('pods.signModal.acceptPol') }}</label>
                   </div>
              </div>
              <div class="modal-footer">
                  <button 
                      @click="$emit('confirm')" 
                      class="btn-primary full-width" 
                      :disabled="isSigning || !signForm.accept_delegation || !signForm.accept_data_policy">
                      {{ $t('pods.signModal.signBtn') }}
                  </button>
              </div>
          </div>
      </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
    show: Boolean,
    signingPod: Object,
    currentDocType: String,
    previewHtml: String,
    signForm: Object,
    isSigning: Boolean
});

defineEmits(['close', 'switchTab', 'confirm']);
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; color: var(--text-main); }
.modal-header h3 { margin: 0; color: var(--text-main); font-size: 1.1rem; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; color: var(--text-main); }
.modal-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-app); flex-shrink: 0; color: var(--text-main); }

.modal-intro { color: var(--text-muted); margin-bottom: 15px; font-size: 0.9rem; }
.modal-tabs { display: flex; gap: 10px; margin-bottom: 15px; }
.modal-tabs button { flex: 1; padding: 8px; border: 1px solid var(--border-color); background: var(--bg-app); color: var(--text-main); border-radius: 6px; cursor: pointer; font-weight: 600; }
.modal-tabs button.active { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }

.doc-preview-container { 
    color: var(--text-main); 
    background: var(--bg-app); 
    border: 1px solid var(--border-color); 
    padding: 15px; 
    border-radius: 8px; 
    height: 35vh; 
    overflow-y: auto; 
    font-size: 0.85rem; 
}
.doc-preview-container :deep(.details) { background-color: var(--bg-app) !important; color: var(--text-main) !important; border-color: var(--border-color) !important; }
.doc-preview-container :deep(*) { color: var(--text-main) !important; }

.checks-container { display: flex; flex-direction: column; gap: 10px; }
.checks-container label { color: var(--text-main); font-weight: 500; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; cursor: pointer;}
.full-width { width: 100%; }
.btn-primary { background-color: var(--accent-blue); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.9rem; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>