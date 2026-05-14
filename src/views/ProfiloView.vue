<template>
  <div class="app-container">
    
    <GuideHeader :isLightMode="isLightMode" :backRoute="backRouteUrl" />

    <main class="main-content">
      
      <div v-if="loading" class="loading-state fade-in">
        <div class="spinner"></div>
        <p>Caricamento profilo...</p>
      </div>

      <template v-else>
        
        <template v-if="!isEditing">
          <section class="card fade-in delay-2">
            <div class="card-header-flex">
              <h2 class="card-title" style="margin: 0;">Dati Personali</h2>
              <button class="btn-icon-text" @click="startEdit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Modifica
              </button>
            </div>

            <div class="info-grid">
              <div class="info-block full-width">
                <label>Identity DID</label>
                <div class="did-box" @click="copyDid">
                  <code>{{ user.profile?.did || 'Generazione in corso...' }}</code>
                  <span class="copy-hint">Copia</span>
                </div>
              </div>

              <div class="info-block full-width">
                <label>Tipo Account</label>
                <div class="info-value">{{ user.profile?.subject_type === 'company' ? '🏢 Azienda' : '👤 Privato' }}</div>
              </div>
              
              <div class="info-block full-width">
                <label>Email</label>
                <div class="info-value">{{ user.email }}</div>
              </div>

              <template v-if="user.profile?.subject_type === 'company'">
                <div class="info-block full-width">
                  <label>Ragione Sociale</label>
                  <div class="info-value">{{ user.profile?.company_name }}</div>
                </div>
                <div class="info-block">
                  <label>Partita IVA</label>
                  <div class="info-value">{{ user.piva }}</div>
                </div>
              </template>
              <template v-else>
                <div class="info-block full-width">
                  <label>Nome Completo</label>
                  <div class="info-value">{{ user.name }} {{ user.surname }}</div>
                </div>
                <div class="info-block">
                  <label>Codice Fiscale</label>
                  <div class="info-value uppercase">{{ user.cf }}</div>
                </div>
              </template>

              <div class="info-block">
                <label>Località</label>
                <div class="info-value">{{ user.profile?.city }} ({{ user.profile?.province }})</div>
              </div>
            </div>
          </section>

          <section v-if="communities.length > 0" class="card fade-in delay-25">
              <h2 class="card-title">Le mie Community</h2>
              <p class="card-text">Sei membro attivo delle seguenti comunità energetiche.</p>
              
              <div class="community-list">
                  <div v-for="comm in communities" :key="comm.id" class="community-item">
                      <div class="comm-icon">🌱</div>
                      <div class="comm-info">
                          <strong>{{ comm.name }}</strong>
                          <span class="comm-type">{{ comm.type }} &bull; {{ comm.address }}</span>
                      </div>
                  </div>
              </div>
          </section>

          <section class="card fade-in delay-3">
            <h2 class="card-title">Documenti e Contratti</h2>
            <p class="card-text">Consulta i termini legali e i codici di condotta che hai sottoscritto.</p>
            
            <div class="doc-list">
              <button class="doc-item hover-scale" @click="viewPdf('terms_esurf')">
                <div class="doc-icon">📄</div>
                <div class="doc-texts">
                  <strong>Termini e-Surf</strong>
                  <span>Visualizza accordo</span>
                </div>
                <div class="doc-arrow">→</div>
              </button>

              <button class="doc-item hover-scale" @click="viewPdf('code_ethics_concernet')">
                <div class="doc-icon">⚖️</div>
                <div class="doc-texts">
                  <strong>Codice Etico</strong>
                  <span>Visualizza regolamento</span>
                </div>
                <div class="doc-arrow">→</div>
              </button>
            </div>
          </section>
        </template>

        <section v-if="isEditing" class="card fade-in"> 
          <h2 class="card-title">{{ profileIncomplete ? 'Completa la Registrazione' : 'Modifica Profilo' }}</h2>
          
          <div v-if="profileIncomplete" class="alert-card fade-in" style="margin-bottom: 24px; background-color: rgba(59, 130, 246, 0.1); border-color: rgba(59, 130, 246, 0.3);">
            <div class="alert-icon" style="color: var(--accent-blue);">👋</div>
            <div>
              <h3 class="alert-title" style="color: var(--accent-blue);">Benvenuto! Un ultimo passaggio...</h3>
              <p class="alert-text">Prima di iniziare a utilizzare la piattaforma e operare sulla rete, è necessario completare la tua scheda anagrafica con i dati obbligatori.</p>
            </div>
          </div>

          <form @submit.prevent="saveProfileChanges" class="edit-form">
            
            <div class="form-group">
              <label>Sei un Privato o un'Azienda?</label>
              <div class="type-switcher">
                <label :class="{ active: editForm.subject_type === 'private' }">
                  <input type="radio" v-model="editForm.subject_type" value="private"> 👤 Privato
                </label>
                <label :class="{ active: editForm.subject_type === 'company' }">
                  <input type="radio" v-model="editForm.subject_type" value="company"> 🏢 Azienda
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Email Account</label>
              <input :value="user.email" disabled class="modern-input readonly-field">
              <span class="input-hint">L'email di accesso non può essere modificata da questa schermata.</span>
            </div>

            <div class="form-row">
              <div class="form-group flex-2">
                <label>Città</label>
                <input v-model="editForm.city" required class="modern-input" placeholder="Comune">
              </div>
              <div class="form-group flex-1">
                <label>Prov.</label>
                <input v-model="editForm.province" required maxlength="2" class="modern-input uppercase" placeholder="RM">
              </div>
            </div>

            <template v-if="editForm.subject_type === 'private'">
              <div class="form-group">
                <label>Nome</label>
                <input v-model="editForm.name" required class="modern-input">
              </div>
              <div class="form-group">
                <label>Cognome</label>
                <input v-model="editForm.surname" required class="modern-input">
              </div>
              <div class="form-group">
                <label>Codice Fiscale</label>
                <input v-model="editForm.cf" required maxlength="16" class="modern-input uppercase" placeholder="16 caratteri">
              </div>
            </template>

            <template v-else>
              <div class="form-group">
                <label>Ragione Sociale</label>
                <input v-model="editForm.company_name" required class="modern-input" placeholder="S.r.l.">
              </div>
              <div class="form-group">
                <label>Partita IVA</label>
                <input v-model="editForm.piva" required maxlength="11" class="modern-input" placeholder="11 cifre">
              </div>
            </template>

            <div class="form-actions mt-4">
              <button type="button" class="btn-text-only" v-if="!profileIncomplete" @click="isEditing = false" :disabled="saving">Annulla</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Salvataggio...' : 'Salva Profilo' }}
              </button>
            </div>
          </form>
        </section>

      </template>
    </main>

    <transition name="fade">
      <div v-if="showPdfModal" class="modal-overlay" @click.self="closePdfModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 style="margin:0; font-size: 16px;">Documento Ufficiale</h3>
            <button class="close-btn" @click="closePdfModal">✕</button>
          </div>
          <div class="modal-body">
            <div v-if="pdfLoading" class="loading-state">
              <div class="spinner"></div>
            </div>
            <iframe v-else :src="pdfUrl" class="pdf-iframe"></iframe>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AuthService from '@/services/AuthService';
import axios from '@/services/axios'; 
import GuideHeader from '@/components/layout/GuideHeader.vue';

const router = useRouter();
const route = useRoute();

// --- STATI GLOBALI ---
const isLightMode = ref(false);
const loading = ref(true);
const user = ref({});
const communities = ref([]); 
const profileIncomplete = ref(false);

// --- STATI EDIT PROFILO ---
const isEditing = ref(false);
const saving = ref(false);
const editForm = ref({});

// --- STATI PDF ---
const showPdfModal = ref(false);
const pdfLoading = ref(false);
const pdfUrl = ref('');

// Gestione dinamica del tasto Back
const backRouteUrl = computed(() => {
  // Se stiamo modificando ma il profilo è già completo, premendo back usciamo dalla modifica
  if (isEditing.value && !profileIncomplete.value) {
    return '/profilo'; 
  }
  // Altrimenti torna alla dashboard di competenza
  if (user.value?.role === 'owner') return '/owner/dashboard';
  if (user.value?.role === 'admin') return '/admin';
  return '/home'; 
});

// Watcher per chiudere il form se l'utente preme la freccia Back nella Navbar
watch(() => route.fullPath, () => {
  if (isEditing.value && !profileIncomplete.value) {
    isEditing.value = false;
  }
});

onMounted(async () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const savedTheme = localStorage.getItem('theme');
  isLightMode.value = savedTheme === 'light';

  await fetchUserData();
  await fetchCommunities(); 
});

const fetchUserData = async () => {
  try {
    const response = await AuthService.getUser();
    user.value = response.data;
    
    const u = user.value;
    const p = u.profile || {};
    
    // Controllo completezza (Sincronizzato con le chiavi del server)
    const commonOk = !!(p.city && p.province);
    let specificOk = false;
    
    if (p.subject_type === 'company') {
      specificOk = !!(p.company_name && u.piva);
    } else {
      specificOk = !!(u.name && u.surname && u.cf);
    }

    if (!commonOk || !specificOk) {
      profileIncomplete.value = true;
      startEdit();
    } else {
      profileIncomplete.value = false;
      isEditing.value = false;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) router.push('/login');
  } finally {
    loading.value = false;
  }
};

const fetchCommunities = async () => {
    try {
        const res = await axios.get('/api/user/communities');
        communities.value = res.data;
    } catch (e) {
        console.error("Errore caricamento community", e);
    }
};

const startEdit = () => {
  const u = user.value;
  const p = u.profile || {};

  editForm.value = {
    subject_type: p.subject_type || 'private',
    name: u.name || '',
    surname: u.surname || '',
    cf: u.cf || '',
    company_name: p.company_name || '',
    piva: u.piva || '',
    city: p.city || '',
    province: p.province || '',
  };
  isEditing.value = true;
};

const saveProfileChanges = async () => {
  saving.value = true;
  try {
    const payload = { ...editForm.value };
    
    // Sanitizzazione payload
    if (payload.subject_type === 'private') {
      payload.company_name = null;
      payload.piva = null;
    } else {
      payload.name = null;
      payload.surname = null;
      payload.cf = null;
    }

    await AuthService.saveProfile(payload);
    await fetchUserData();
  } catch (e) {
    alert("Errore salvataggio: " + (e.response?.data?.message || 'Controlla i dati inseriti'));
  } finally {
    saving.value = false;
  }
};

const copyDid = () => {
  if (user.value.profile?.did) {
    navigator.clipboard.writeText(user.value.profile.did);
  }
};

const viewPdf = async (type) => {
  showPdfModal.value = true;
  pdfLoading.value = true;
  try {
    const res = await AuthService.downloadLegalPdf(type);
    pdfUrl.value = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  } catch (e) {
    showPdfModal.value = false;
    alert("Errore nel download del documento.");
  } finally {
    pdfLoading.value = false;
  }
};

const closePdfModal = () => {
  showPdfModal.value = false;
  if (pdfUrl.value) window.URL.revokeObjectURL(pdfUrl.value);
};
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* READ-ONLY LAYOUT */
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; }
.btn-icon-text { background: transparent; border: 1px solid var(--border-color); border-radius: 8px; color: var(--accent-blue); padding: 6px 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer; }
.info-grid { display: flex; flex-direction: column; gap: 16px; }
.info-block label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); margin-bottom: 4px; }
.info-value { font-size: 15px; font-weight: 500; color: var(--text-main); }
.uppercase { text-transform: uppercase; }

.did-box { background: var(--bg-app); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.did-box code { font-family: monospace; font-size: 12px; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%; }
.copy-hint { font-size: 11px; color: var(--accent-blue); font-weight: bold; }

/* ALERT & FORMS */
.alert-card { display: flex; gap: 16px; align-items: flex-start; padding: 16px; border-radius: 12px; border: 1px solid transparent; }
.alert-icon { font-size: 24px; }
.alert-title { margin: 0 0 4px 0; font-size: 16px; font-weight: 700; }
.alert-text { margin: 0; font-size: 13px; color: var(--text-main); opacity: 0.9; }

.form-group { margin-bottom: 16px; }
.form-row { display: flex; gap: 12px; }
.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
.modern-input { width: 100%; background-color: var(--bg-app); color: var(--text-main); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; font-size: 15px; box-sizing: border-box; }
.readonly-field { opacity: 0.6; cursor: not-allowed; background-color: var(--bg-card); }
.input-hint { font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block; }

.type-switcher { display: flex; gap: 8px; background: var(--bg-app); padding: 6px; border-radius: 10px; border: 1px solid var(--border-color); }
.type-switcher label { flex: 1; text-align: center; padding: 10px; font-size: 14px; font-weight: 600; color: var(--text-muted); border-radius: 6px; cursor: pointer; margin: 0; transition: all 0.2s; }
.type-switcher label.active { background: var(--btn-bg); color: var(--text-main); }
.type-switcher input { display: none; }
.form-actions { display: flex; flex-direction: column; gap: 10px; }
.mt-4 { margin-top: 24px; }

/* COMMUNITY & DOCS */
.community-list { display: flex; flex-direction: column; gap: 12px; margin-top: 15px; }
.community-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 12px; }
.comm-icon { width: 36px; height: 36px; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.comm-info { display: flex; flex-direction: column; }
.comm-info strong { font-size: 0.95rem; color: var(--text-main); }
.comm-type { font-size: 0.8rem; color: var(--text-muted); }

.doc-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.doc-item { display: flex; align-items: center; background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; text-align: left; cursor: pointer; color: var(--text-main); transition: background-color 0.2s; }
.doc-icon { font-size: 24px; margin-right: 16px; background: var(--bg-card); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
.doc-texts { flex-grow: 1; display: flex; flex-direction: column; }
.doc-texts strong { font-size: 15px; font-weight: 600; }
.doc-texts span { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.doc-arrow { color: var(--accent-blue); font-weight: bold; }

/* MODALS */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); z-index: 999; display: flex; justify-content: center; align-items: center; padding: 16px; }
.modal-content { background: var(--bg-card); width: 100%; max-width: 480px; height: 85vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border-color); }
.modal-header { padding: 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); color: var(--text-main); }
.close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
.modal-body { flex-grow: 1; background: #fff; position: relative; }
.pdf-iframe { width: 100%; height: 100%; border: none; }

/* UI UTILS */
.loading-state { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100px; color: var(--text-muted); font-size: 14px; }
.spinner { width: 30px; height: 30px; border: 3px solid var(--border-color); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>