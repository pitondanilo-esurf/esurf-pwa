<template>
  <div class="owner-layout survey-page">
    <main class="main-content">
      
      <header class="top-header fade-in delay-0">
        <button class="back-btn" @click="goBack" aria-label="Torna indietro">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div class="header-center">
          <img 
            :src="isLightMode ? '/src/assets/img/logo-light.svg' : '/src/assets/img/logo-dark.svg'" 
            alt="E-surf Logo" 
            class="app-logo" 
          />
        </div>
        <div style="width: 36px;"></div> 
      </header>

      <div v-if="loading" class="loader-container">
        <div class="spinner"></div>
        <p class="animate-pulse">{{ $t('common.loading', 'Configurazione moduli in corso...') }}</p>
      </div>

      <div v-else-if="hasVoted || successMessage" class="setup-container fade-in">
        <div class="glass-card setup-box" :class="{ 'success-border': successMessage }">
          <div class="icon-wrapper">{{ successMessage ? '🎉' : '✅' }}</div>
          <h2>{{ successMessage ? 'Grazie!' : $t('survey.alreadyVoted', 'Sondaggio completato') }}</h2>
          <p class="text-muted">
            {{ successMessage ? successMessage : $t('survey.alreadyVotedDesc', 'Hai già risposto a questa survey.') }}
          </p>
          <button @click="router.push('/owner/dashboard')" class="btn-primary mt-4">
            {{ $t('common.goToDashboard', 'Torna alla Dashboard') }}
          </button>
        </div>
      </div>

      <div v-else class="survey-grid fade-in delay-1">
        <div class="section-card glass shadow-lg">
          <div v-if="errorMessage" class="alert-error mb-4">
            <span class="icon">⚠️</span> {{ errorMessage }}
          </div>

          <form @submit.prevent="submitSurvey" class="setup-form">
            <div v-for="(block, bIdx) in surveySchema.blocks" :key="bIdx" class="survey-block">
              <h3 class="block-title mt-4 mb-3">{{ block.title }}</h3>
              
              <div v-for="(field, fIdx) in block.questions" :key="field.id" class="form-group mb-4">
                <label :for="field.id" class="fw-semibold">{{ field.label }}</label>
                <p v-if="field.context" class="text-muted small mb-2">{{ field.context }}</p>

                <div v-if="field.type === 'radio'" class="radio-group">
                  <label v-for="opt in field.options" :key="opt.value" class="radio-item" :class="{ active: form[field.id] === opt.value }">
                    <input v-model="form[field.id]" type="radio" :name="field.id" :value="opt.value" required>
                    <span class="custom-radio-circle"></span>
                    <span>{{ opt.text }}</span>
                  </label>
                </div>

                <div v-else-if="field.type === 'range'" class="range-container">
                  <input v-model.number="form[field.id]" type="range" class="custom-range" :min="field.min" :max="field.max" :step="field.step">
                  <div class="range-labels">
                     <span class="range-val">{{ field.min }}{{ field.unit }}</span>
                     <span class="range-val current highlight-text">{{ form[field.id] }}{{ field.unit }}</span>
                     <span class="range-val">{{ field.max }}{{ field.unit }}</span>
                  </div>
                </div>

                <textarea v-else-if="field.type === 'textarea'" 
                  :id="field.id"
                  v-model="form[field.id]" 
                  class="compact-input" 
                  rows="4" 
                  :placeholder="field.placeholder || 'Scrivi qui...'" 
                  required>
                </textarea>
              </div>
              <hr class="divider">
            </div>

            <div class="actions mt-5">
              <button type="submit" class="btn-primary w-100 py-3" :disabled="submitting">
                <span v-if="submitting" class="spinner-inline"></span>
                {{ submitting ? $t('common.sending', 'Invio...') : $t('survey.submitBtn', 'Invia Feedback Strategico') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router'; // Import aggiunto
import axios from '@/services/axios';

const router = useRouter();
const route = useRoute(); // Inizializzazione rotta
const { t } = useI18n();

// STATO
const isLightMode = ref(false);
const loading = ref(true);
const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const hasVoted = ref(false);

// DATI DINAMICI
const surveySchema = ref({ blocks: [] });
const schemaVersion = ref('');
const form = ref({});

// Identificativo dinamico recuperato dall'URL (:schemaName)
const currentSchemaName = computed(() => route.params.schemaName);

const goBack = () => router.back();

onMounted(async () => {
  isLightMode.value = localStorage.getItem('theme') === 'light' || document.body.classList.contains('light-mode');

  try {
    // Chiamata API dinamica basata sullo slug nell'URL
    const res = await axios.get(`/api/survey/schema/${currentSchemaName.value}`);
    const { schema, hasVoted: voted } = res.data;

    // Parsing dello schema_json dal database campaign_schemas
    const parsedSchema = typeof schema.schema_json === 'string' 
      ? JSON.parse(schema.schema_json) 
      : schema.schema_json;

    surveySchema.value = parsedSchema;
    schemaVersion.value = schema.schema_version;
    hasVoted.value = voted;

    // Inizializzazione reattiva del form basata sui blocchi dello schema
    const initialForm = {};
    parsedSchema.blocks.forEach(block => {
      block.questions.forEach(q => {
        initialForm[q.id] = q.default !== undefined ? q.default : (q.type === 'range' ? q.min : '');
      });
    });
    form.value = initialForm;

  } catch (error) {
    errorMessage.value = error.response?.status === 404 
        ? "Sondaggio non trovato nel sistema." 
        : "Errore durante il caricamento dello schema.";
  } finally {
    loading.value = false;
  }
});

const submitSurvey = async () => {
  submitting.value = true;
  errorMessage.value = '';

  try {
    await axios.get('/sanctum/csrf-cookie');

    const payload = {
      schema_name: currentSchemaName.value, // Nome dinamico per il backend
      schema_version: schemaVersion.value,
      answers: form.value
    };

    await axios.post('/api/survey/responses', payload);
    
    successMessage.value = "Grazie! Il tuo feedback è stato salvato correttamente.";
    hasVoted.value = true; 
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    errorMessage.value = error.response?.data?.error || "Errore durante l'invio delle risposte.";
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Stili mantenuti come nel file precedente, ottimizzati per la visualizzazione a blocchi */
.owner-layout { min-height: 100vh; background: var(--bg-app); color: var(--text-main); }
.main-content { padding: 2rem; max-width: 850px; margin: 0 auto; }
.top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
.back-btn { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; }
.section-card { background: var(--bg-card); padding: 3rem; border-radius: 24px; border: 1px solid var(--border-color); }
.block-title { font-size: 1.4rem; font-weight: 800; color: var(--accent-blue); border-left: 4px solid var(--accent-blue); padding-left: 15px; }
.divider { border: 0; border-top: 1px dashed var(--border-color); margin: 2.5rem 0; opacity: 0.5; }
.radio-group { display: flex; flex-direction: column; gap: 10px; }
.radio-item { display: flex; align-items: center; gap: 12px; padding: 15px; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; }
.radio-item.active { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.05); }
.custom-range { width: 100%; accent-color: var(--accent-blue); }
.compact-input { width: 100%; padding: 12px; border-radius: 10px; background: var(--bg-app); border: 1px solid var(--border-color); color: var(--text-main); }
</style>