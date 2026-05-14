
<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content main-content-tight">
      <div class="f-header-section fade-in">
        <h1 class="f-page-title">{{ $t('support.title') }}</h1>
        <p class="f-page-subtitle">{{ $t('support.subtitle') }}</p>
      </div>

      <div class="f-divider fade-in delay-1"></div>

      <div class="f-faq-banner hover-lift fade-in delay-1" @click="goToFaq">
        <div class="f-faq-banner-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="f-faq-banner-text">
          <h3 class="f-faq-banner-title">{{ $t('support.faqBannertitle') || 'Consulta le Domande Frequenti' }}</h3>
          <p class="f-faq-banner-subtitle">{{ $t('support.faqBannersubtitle') || 'Trova subito la risposta che cerchi prima di contattarci.' }}</p>
        </div>
        <div class="f-action-circle">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>

      <div class="f-contact-grid fade-in delay-2">
        <a href="mailto:support@esurf.it" class="f-contact-card hover-lift">
          <div class="f-contact-icon icon-email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div class="f-contact-info">
            <h3 class="f-contact-label">{{ $t('support.channels.email.label') }}</h3>
            <p class="f-contact-value">support@esurf.it</p>
          </div>
        </a>

        <a href="https://wa.me/390111234567" target="_blank" class="f-contact-card hover-lift">
          <div class="f-contact-icon icon-whatsapp">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.8.9L21 3z"></path>
            </svg>
          </div>
          <div class="f-contact-info">
            <h3 class="f-contact-label">{{ $t('support.channels.whatsapp.label') }}</h3>
            <p class="f-contact-value">+39 011 123 4567</p>
          </div>
        </a>
      </div>

      <div class="f-support-form-container glass-card fade-in delay-3">
        <h2 class="f-form-title">{{ $t('support.form.title') }}</h2>
        <p class="f-form-subtitle">{{ $t('support.form.subtitle') }}</p>

        <form @submit.prevent="handleSubmit" class="f-support-form">
          <div class="f-form-group">
            <label>{{ $t('support.form.fields.subject') }}</label>
            <select v-model="form.subject" class="f-input">
              <option value="technical">{{ $t('support.form.subjects.technical') }}</option>
              <option value="billing">{{ $t('support.form.subjects.billing') }}</option>
              <option value="account">{{ $t('support.form.subjects.account') }}</option>
              <option value="other">{{ $t('support.form.subjects.other') }}</option>
            </select>
          </div>

          <div class="f-form-group">
            <label>{{ $t('support.form.fields.message') }}</label>
            <textarea 
              v-model="form.message" 
              class="f-input f-textarea" 
              :placeholder="$t('support.form.fields.placeholder')"
              required
            ></textarea>
          </div>

          <button type="submit" class="f-btn-submit" :disabled="isSending">
            <span v-if="!isSending">{{ $t('support.form.submit') }}</span>
            <div v-else class="f-spinner-small"></div>
          </button>
        </form>
      </div>
    </main>

    <BottomNavbar class="fade-in delay-3" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
// Importazione componenti layout
import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

const router = useRouter();
const isSending = ref(false);
const form = reactive({
  subject: 'technical',
  message: ''
});

// Indirizza alla pagina in cui hai inserito le FAQ (es. /guides o /faq)
const goToFaq = () => {
  router.push('/faq?back=/support'); 
};

const handleSubmit = async () => {
  isSending.value = true;
  setTimeout(() => {
    alert("Messaggio inviato con successo!");
    form.message = '';
    isSending.value = false;
  }, 1500);
};
</script>

<style scoped>
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1.5rem 1rem 5rem 1rem; max-width: 800px; margin: 0 auto; padding-bottom: 100px; }

/* HEADER */
.f-header-section { margin-bottom: 1.5rem; }
.f-page-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.8px; margin: 0; }
.f-page-subtitle { color: var(--text-muted); font-size: 0.95rem; margin-top: 0.5rem; }
.f-divider { height: 1px; background: var(--border-color); margin: 2rem 0; opacity: 0.6; }

/* BANNER FAQ */
.f-faq-banner {
  display: flex; align-items: center; gap: 16px;
  background: var(--bg-card); border: 1px solid var(--border-color);
  padding: 20px; border-radius: 16px; margin-bottom: 2rem;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.f-faq-banner:hover { border-color: var(--accent-blue); background: var(--bg-card-alt, var(--bg-card)); }
.f-faq-banner-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(59, 130, 246, 0.1); color: var(--accent-blue);
  display: flex; justify-content: center; align-items: center; flex-shrink: 0;
}
.f-faq-banner-text { flex: 1; }
.f-faq-banner-title { font-size: 1.05rem; font-weight: 700; margin: 0 0 4px 0; color: var(--text-main); letter-spacing: -0.3px; }
.f-faq-banner-subtitle { font-size: 0.85rem; color: var(--text-muted); margin: 0; line-height: 1.4; }

.f-action-circle {
  width: 32px; height: 32px; border-radius: 50%;
  background: transparent; border: 1px solid var(--border-color);
  color: var(--text-muted); display: flex; justify-content: center; align-items: center;
  transition: all 0.3s ease; flex-shrink: 0;
}
.f-faq-banner:hover .f-action-circle { background: var(--text-main); color: var(--bg-card); border-color: var(--text-main); }

/* GRID CONTATTI */
.f-contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 2rem; }
.f-contact-card { 
  display: flex; align-items: center; gap: 16px; 
  background: var(--bg-card); border: 1px solid var(--border-color); 
  padding: 20px; border-radius: 16px; text-decoration: none; color: inherit;
}
.f-contact-card:hover { border-color: var(--accent-blue); }
.f-contact-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon-email { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
.icon-whatsapp { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.f-contact-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin: 0; }
.f-contact-value { font-size: 1rem; font-weight: 600; color: var(--text-main); margin: 2px 0 0 0; }

/* FORM */
.f-support-form-container { padding: 24px; border-radius: 20px; border: 1px solid var(--border-color); }
.f-form-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
.f-form-subtitle { font-size: 0.9rem; color: var(--text-muted); margin: 8px 0 24px 0; }
.f-form-group { margin-bottom: 20px; }
.f-form-group label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
.f-input { width: 100%; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; color: var(--text-main); font-family: inherit; font-size: 0.95rem; }
.f-textarea { min-height: 120px; resize: vertical; }
.f-btn-submit { width: 100%; background: var(--text-main); color: var(--bg-card); border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; }

/* UTILS */
.hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06); }
.f-spinner-small { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
