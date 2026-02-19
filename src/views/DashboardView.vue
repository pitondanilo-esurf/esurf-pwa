<template>
  <div class="page-wrapper">
    
    <nav class="navbar glass-nav">
      <div class="nav-container">
        <div class="brand">
          <div class="logo-box">🌊</div>
          <span class="brand-text">e-Surf <span class="light">Identity</span></span>
        </div>

        <div class="desktop-menu" v-if="!loading">
           <template v-if="isCompliant && !profileIncomplete">
             <a href="#" class="nav-link" :class="{ active: activeView === 'dashboard' }" @click.prevent="activeView = 'dashboard'">
               Panoramica
             </a>
             <a href="#" class="nav-link" :class="{ active: activeView === 'profile' }" @click.prevent="activeView = 'profile'">
               Profilo
             </a>
             <a href="/pods" class="nav-link">
               Contatori
             </a>
           </template>
           <div v-else-if="!isCompliant && !profileIncomplete" class="nav-warning" @click="forceSigningView">
             Firma Richiesta
           </div>
           <div v-else class="nav-warning">
             Completa Profilo
           </div>
        </div>

        <div class="desktop-actions">
           <div class="user-pill">
              {{ (user.profile?.first_name || user.first_name || 'U')[0].toUpperCase() }}
           </div>
           <button @click="handleLogout" class="btn-logout-icon" title="Esci">logout</button>
        </div>

        <button class="hamburger" @click="toggleMenu">
          <span class="bar" :class="{ open: isMenuOpen }"></span>
          <span class="bar" :class="{ open: isMenuOpen }"></span>
          <span class="bar" :class="{ open: isMenuOpen }"></span>
        </button>
      </div>

      <transition name="slide-down">
        <div v-if="isMenuOpen" class="mobile-menu glass-panel">
          <template v-if="isCompliant && !profileIncomplete">
            <a href="#" class="mobile-link" @click="setMobileView('dashboard')">Panoramica</a>
            <a href="#" class="mobile-link" @click="setMobileView('profile')">Profilo</a>
            <a href="/pods" class="mobile-link">I miei Contatori</a>
          </template>
          <div v-else class="mobile-link warning">⚠️ Azione Richiesta</div>
          <div class="divider"></div>
          <button @click="handleLogout" class="mobile-link logout">Esci</button>
        </div>
      </transition>
    </nav>

    <main class="main-content">
      
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div> 
        <p>Sincronizzazione dati...</p>
      </div>

      <transition name="fade" mode="out-in">
          
          <div v-if="!loading && !isCompliant && !profileIncomplete" class="content-container" key="signing">
            <div class="glass-card sign-card">
              <div class="card-header-centered">
                <div class="icon-header">📜</div>
                <h3>Firma Digitale Contratti</h3>
                <p>È necessario accettare i seguenti documenti per attivare l'identità digitale.</p>
              </div>
              
              <div class="segmented-control">
                <button @click="currentTab = 'esurf'" :class="{ active: currentTab === 'esurf' }">1. Termini e-Surf</button>
                <button @click="currentTab = 'concernet'" :class="{ active: currentTab === 'concernet' }">2. Codice Etico</button>
              </div>
              <div class="doc-preview-paper">
                 <div v-if="docLoading" class="doc-loading"><div class="spinner-small"></div> Caricamento...</div>
                 <div v-else class="doc-content" v-html="currentDocHtml"></div>
              </div>
              <div class="actions-sticky">
                <div class="consent-box">
                  <label class="modern-checkbox"><input type="checkbox" v-model="form.accept_esurf"><span class="check-box"></span><span class="text">Accetto Termini</span></label>
                  <label class="modern-checkbox"><input type="checkbox" v-model="form.accept_concernet"><span class="check-box"></span><span class="text">Accetto Codice Etico</span></label>
                </div>
                <button @click="submitSign" class="btn-primary-large" :disabled="!form.accept_esurf || !form.accept_concernet || signing">{{ signing ? 'Firma...' : '🖊️ FIRMA E ATTIVA' }}</button>
              </div>
            </div>
          </div>

          <div v-else-if="!loading && (activeView === 'profile' || profileIncomplete)" class="content-container" key="profile">
            <div class="glass-card profile-card">
              
              <div class="card-header flex-between">
                <div>
                  <h3>Dati Personali</h3>
                  <p class="subtitle">Gestisci le informazioni della tua identità.</p>
                </div>
                <button v-if="!isEditing && !profileIncomplete" @click="startEdit" class="btn-icon-text">✏️ Modifica</button>
              </div>

              <div v-if="profileIncomplete" class="alert-warning-box">
                  ⚠️ <strong>Profilo Incompleto:</strong> Per completare l'attivazione, compila i campi obbligatori (es. Codice Fiscale o P.IVA).
              </div>

              <div v-if="!isEditing && !profileIncomplete" class="profile-grid">
                <div class="profile-section full-span">
                  <label>Identity DID</label>
                  <div class="did-box" @click="copyDid">
                    <code>{{ user.profile?.did || 'Generating...' }}</code>
                    <span class="copy-hint">Copia</span>
                  </div>
                </div>
                
                <div class="info-block">
                  <label>Tipo Soggetto</label>
                  <div class="info-value">{{ user.profile?.subject_type === 'company' ? '🏢 Azienda' : '👤 Privato' }}</div>
                </div>
                <div class="info-block">
                  <label>Email</label>
                  <div class="info-value">{{ user.email }}</div>
                </div>

                <template v-if="user.profile?.subject_type === 'company'">
                    <div class="info-block full-span">
                        <label>Ragione Sociale</label>
                        <div class="info-value">{{ user.profile?.company_name }}</div>
                    </div>
                    <div class="info-block">
                        <label>Partita IVA</label>
                        <div class="info-value">{{ user.profile?.vat_number }}</div>
                    </div>
                </template>
                <template v-else>
                    <div class="info-block">
                        <label>Nome Completo</label>
                        <div class="info-value">{{ user.profile?.first_name }} {{ user.profile?.last_name }}</div>
                    </div>
                    <div class="info-block">
                        <label>Codice Fiscale</label>
                        <div class="info-value">{{ user.profile?.tax_code }}</div>
                    </div>
                </template>

                <div class="info-block">
                  <label>Località</label>
                  <div class="info-value">{{ user.profile?.city }} ({{ user.profile?.province }})</div>
                </div>

                <div class="info-block full-span prefs-block">
                    <label>Preferenze Privacy</label>
                    <div class="tags-container">
                        <span class="tag" :class="{active: user.profile?.allow_cer_discovery}">CER Discovery: {{ user.profile?.allow_cer_discovery ? 'Sì' : 'No' }}</span>
                        <span class="tag" :class="{active: user.profile?.allow_esco_offers}">Offerte ESCO: {{ user.profile?.allow_esco_offers ? 'Sì' : 'No' }}</span>
                    </div>
                </div>
              </div>

              <form v-else @submit.prevent="saveProfileChanges" class="edit-form-grid">
                 
                 <div class="form-group full-span type-selector-container">
                    <label>Sei un Privato o un'Azienda?</label>
                    <div class="type-switcher">
                        <label :class="{active: editForm.subject_type === 'private'}">
                            <input type="radio" v-model="editForm.subject_type" value="private"> 👤 Privato
                        </label>
                        <label :class="{active: editForm.subject_type === 'company'}">
                            <input type="radio" v-model="editForm.subject_type" value="company"> 🏢 Azienda
                        </label>
                    </div>
                 </div>

                 <div class="form-group"><label>Città</label><input v-model="editForm.city" required class="modern-input" placeholder="Comune di residenza/sede"></div>
                 <div class="form-group"><label>Provincia</label><input v-model="editForm.province" maxlength="2" class="modern-input uppercase" placeholder="RM" required></div>

                 <template v-if="editForm.subject_type === 'private'">
                    <div class="form-group"><label>Nome</label><input v-model="editForm.first_name" class="modern-input" required></div>
                    <div class="form-group"><label>Cognome</label><input v-model="editForm.last_name" class="modern-input" required></div>
                    <div class="form-group full-span">
                        <label>Codice Fiscale</label>
                        <input v-model="editForm.tax_code" class="modern-input uppercase" maxlength="16" required placeholder="Codice Fiscale (16 caratteri)">
                    </div>
                 </template>

                 <template v-else>
                    <div class="form-group full-span">
                        <label>Ragione Sociale</label>
                        <input v-model="editForm.company_name" class="modern-input" required placeholder="Nome Azienda S.r.l.">
                    </div>
                    <div class="form-group full-span">
                        <label>Partita IVA</label>
                        <input v-model="editForm.vat_number" class="modern-input" maxlength="11" required placeholder="Partita IVA (11 cifre)">
                    </div>
                 </template>

                 <div class="form-group full-span checkboxes-group">
                    <label class="check-row">
                        <input type="checkbox" v-model="editForm.allow_cer_discovery">
                        <div>
                            <strong>Visibile alle CER</strong>
                            <span class="sub-text">Permetti alle Comunità Energetiche di trovarti (allow_cer_discovery)</span>
                        </div>
                    </label>
                    <label class="check-row">
                        <input type="checkbox" v-model="editForm.allow_esco_offers">
                        <div>
                            <strong>Offerte ESCO</strong>
                            <span class="sub-text">Ricevi proposte di efficientamento (allow_esco_offers)</span>
                        </div>
                    </label>
                 </div>

                 <div class="form-actions full-span">
                    <button type="button" v-if="!profileIncomplete" @click="isEditing = false" class="btn-ghost">Annulla</button>
                    <button type="submit" class="btn-primary" :disabled="saving">
                        {{ saving ? 'Salvataggio...' : 'Salva Profilo' }}
                    </button>
                 </div>
              </form>
            </div>
          </div>

          <div v-else-if="!loading" class="content-container dashboard-home" key="dashboard">
            <div class="glass-card welcome-card">
               <h2>Ciao, {{ displayName }} 👋</h2>
               <p>La tua identità digitale è attiva e conforme.</p>
               <div class="status-badge">✅ Account Verificato</div>
            </div>
            
            <div class="cards-grid">
                <div class="glass-card doc-card" @click="viewPdf('terms_esurf')">
                  <div class="icon">📄</div>
                  <div><h4>Termini e Condizioni</h4><p>Visualizza Contratto</p></div>
                </div>
                <div class="glass-card doc-card" @click="viewPdf('code_ethics_concernet')">
                  <div class="icon">⚖️</div>
                  <div><h4>Codice Etico</h4><p>Visualizza Contratto</p></div>
                </div>
            </div>
          </div>

      </transition>
    </main>

    <transition name="modal-fade">
        <div v-if="showPdfModal" class="modal-backdrop" @click.self="closePdfModal">
            <div class="glass-modal pdf-viewer-modal">
                <div class="modal-header">
                    <h3>Documento Contrattuale</h3>
                    <button @click="closePdfModal" class="btn-close-modal">✕</button>
                </div>
                <div class="modal-body-pdf">
                    <div v-if="pdfLoading" class="pdf-loading"><div class="spinner"></div></div>
                    <iframe v-else :src="pdfUrl" class="pdf-iframe" title="PDF"></iframe>
                </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AuthService from '@/services/AuthService';

const router = useRouter();
const route = useRoute();
const user = ref({});
const isCompliant = ref(false); 
const loading = ref(true); 
const activeView = ref('dashboard');
const isMenuOpen = ref(false);

// Stato Profilo Incompleto
const profileIncomplete = ref(false);

// Stati Modifica
const isEditing = ref(false);
const saving = ref(false);
const editForm = ref({});

// Stati Firma & PDF
const currentTab = ref('esurf'); 
const docLoading = ref(false);
const currentDocHtml = ref('');
const signing = ref(false);
const form = ref({ accept_esurf: false, accept_concernet: false });
const showPdfModal = ref(false);
const pdfLoading = ref(false);
const pdfUrl = ref('');

// Computed per nome visualizzato
const displayName = computed(() => {
    const p = user.value.profile;
    if (!p) return user.value.name || 'Utente';
    return p.subject_type === 'company' ? p.company_name : p.first_name;
});

// --- INIT ---
onMounted(async () => {
  try {
    await fetchUserData();
    if (route.query.view === 'profile') activeView.value = 'profile';
    
    // Se compliant=false E profilo completo, carica doc
    if (!isCompliant.value && !profileIncomplete.value) {
        loadPreviewDoc('terms_esurf');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) router.push('/login');
  } finally {
    loading.value = false; 
  }
});

const fetchUserData = async () => {
    const response = await AuthService.getUser();
    user.value = response.data;
    isCompliant.value = !!response.data.is_compliant;
    
    // --- VALIDAZIONE COMPLETEZZA PROFILO (User Profiles Table) ---
    const p = user.value.profile || {};
    
    // Campi comuni obbligatori
    const commonOk = p.city && p.province;
    
    let specificOk = false;
    if (p.subject_type === 'company') {
        // Azienda: serve company_name e vat_number
        specificOk = p.company_name && p.vat_number;
    } else {
        // Privato (default): serve nome, cognome, codice fiscale
        specificOk = p.first_name && p.last_name && p.tax_code;
    }

    if (!commonOk || !specificOk) {
        profileIncomplete.value = true;
        activeView.value = 'profile'; // Forza vista profilo
        startEdit(); // Apre il form
    } else {
        profileIncomplete.value = false;
        // Se il profilo è ok ma non ha firmato, carica i doc
        if (!isCompliant.value && !docLoading.value) loadPreviewDoc('terms_esurf');
    }
};

// --- LOGICA EDIT PROFILO ---
const startEdit = () => {
    const p = user.value.profile || {};
    const u = user.value; // Fallback su tabella users base

    // Mappatura completa tabella user_profiles
    editForm.value = {
        subject_type: p.subject_type || 'private',
        
        first_name: p.first_name || u.name || '',
        last_name: p.last_name || u.surname || '',
        tax_code: p.tax_code || '',
        
        company_name: p.company_name || '',
        vat_number: p.vat_number || '',
        
        city: p.city || '',
        province: p.province || '',
        
        // Booleani (conversione sicura)
        allow_cer_discovery: !!p.allow_cer_discovery,
        allow_esco_offers: !!p.allow_esco_offers
    };
    isEditing.value = true;
};

const saveProfileChanges = async () => {
    saving.value = true;
    try { 
        // Prepara payload
        const payload = { ...editForm.value };
        
        // Pulizia dati in base al tipo (opzionale, ma pulito per il DB)
        if (payload.subject_type === 'private') {
            payload.company_name = null;
            payload.vat_number = null;
        } else {
            payload.first_name = null;
            payload.last_name = null;
            payload.tax_code = null;
        }

        await AuthService.saveProfile(payload); 
        await fetchUserData(); // Ricarica per verificare completezza
        isEditing.value = false; 
    } 
    catch (e) { alert("Errore salvataggio: " + (e.response?.data?.message || 'Controlla i dati inseriti')); } 
    finally { saving.value = false; }
};

// --- LOGICA FIRMA & PDF (Invariata) ---
const loadPreviewDoc = async (type) => {
    docLoading.value = true;
    try {
        const res = await AuthService.getLegalPreview(type);
        currentDocHtml.value = res.data.html_content; 
    } catch (e) { currentDocHtml.value = "<p>Errore caricamento.</p>"; } 
    finally { docLoading.value = false; }
};

watch(currentTab, (newTab) => {
    if (!isCompliant.value && !loading.value && !profileIncomplete.value) {
        if (newTab === 'esurf') loadPreviewDoc('terms_esurf');
        if (newTab === 'concernet') loadPreviewDoc('code_ethics_concernet');
    }
});

const submitSign = async () => {
    signing.value = true;
    try {
        const payload = { accept_esurf: true, accept_concernet: true };
        if (AuthService.signGlobal) await AuthService.signGlobal(payload);
        else await AuthService.saveProfile({ ...user.value.profile, ...payload });
        await fetchUserData();
    } catch (e) { alert("Errore firma."); } finally { signing.value = false; }
};

const viewPdf = async (type) => {
    showPdfModal.value = true; pdfLoading.value = true;
    try {
        const res = await AuthService.downloadLegalPdf(type);
        pdfUrl.value = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    } catch (e) { showPdfModal.value = false; alert("Errore download."); } finally { pdfLoading.value = false; }
};
const closePdfModal = () => { showPdfModal.value = false; if(pdfUrl.value) window.URL.revokeObjectURL(pdfUrl.value); };

// --- UTILS ---
const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value;
const setMobileView = (view) => { activeView.value = view; isMenuOpen.value = false; };
const forceSigningView = () => { if (isCompliant.value) { activeView.value = 'dashboard'; isMenuOpen.value = false; } };
const handleLogout = async () => { try { await AuthService.logout(); } catch(e){} finally { router.push('/'); } };
const copyDid = () => { if(user.value.profile?.did) navigator.clipboard.writeText(user.value.profile.did); };
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root { --primary: #3b82f6; --nav-height: 90px; }
.page-wrapper { min-height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; padding-top: var(--nav-height); color: #334155; }

/* NAVBAR & MENU (Invariati) */
.navbar { position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-height); z-index: 1000; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.5); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
.nav-container { max-width: 1200px; margin: 0 auto; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; }
.brand { display: flex; align-items: center; gap: 10px; }
.logo-box { width: 35px; height: 35px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.brand-text { font-weight: 700; font-size: 1.2rem; color: #1e293b; }
.desktop-menu { display: flex; gap: 20px; align-items: center; }
.nav-link { text-decoration: none; color: #64748b; font-weight: 500; padding: 6px 12px; border-radius: 8px; transition: 0.2s; }
.nav-link:hover { color: #3b82f6; background: #eff6ff; }
.nav-link.active { color: #2563eb; background: #eff6ff; font-weight: 600; }
.nav-warning { color: #ea580c; font-weight: bold; cursor: pointer; animation: pulse 2s infinite; padding: 6px 12px; background: #fff7ed; border-radius: 8px; }
.desktop-actions { display: flex; align-items: center; gap: 15px; }
.user-pill { width: 35px; height: 35px; background: #eff6ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.btn-logout-icon { border: none; background: transparent; font-size: 1.2rem; cursor: pointer; padding: 5px; opacity: 0.6; }
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; }
.bar { width: 25px; height: 3px; background-color: #334155; border-radius: 2px; transition: 0.3s; }
.mobile-menu { position: absolute; top: var(--nav-height); left: 0; width: 100%; background: white; padding: 1rem; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.mobile-link { text-decoration: none; color: #334155; padding: 12px; border-radius: 8px; font-weight: 500; text-align: center; background: #f8fafc; }

/* CONTENT LAYOUT */
.main-content { padding: 4rem 1rem 2rem 1rem; max-width: 1100px; margin: 0 auto; }
.content-container { animation: fadeIn 0.5s ease; }
.glass-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border-radius: 20px; border: 1px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 2rem; margin-bottom: 2rem; }

/* ALERT & INFO */
.alert-warning-box { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 10px; }

/* PROFILO GRID */
.profile-grid, .edit-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.full-span { grid-column: 1 / -1; }
.card-header.flex-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.btn-icon-text { background: transparent; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; cursor: pointer; color: #2563eb; font-weight: 500; }

.info-block label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase; font-weight: 600; }
.info-value { font-size: 1.05rem; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
.did-box code { font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; color: #475569; }
.prefs-block .tags-container { display: flex; gap: 10px; margin-top: 5px; }
.tag { font-size: 0.85rem; padding: 4px 10px; border-radius: 20px; background: #f1f5f9; color: #64748b; }
.tag.active { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }

/* FORM EDIT STYLES */
.type-selector-container { background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px dashed #e2e8f0; }
.type-switcher { display: flex; gap: 20px; margin-top: 10px; }
.type-switcher label { cursor: pointer; padding: 8px 16px; border-radius: 8px; border: 1px solid transparent; transition: 0.2s; font-weight: 500; }
.type-switcher label.active { background: #fff; border-color: #3b82f6; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.type-switcher input { display: none; }

.modern-input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; transition: 0.2s; box-sizing: border-box; }
.modern-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.form-group label { display: block; font-size: 0.85rem; color: #64748b; margin-bottom: 6px; font-weight: 600; }

.checkboxes-group { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 12px; }
.check-row { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
.check-row input { margin-top: 4px; width: 18px; height: 18px; accent-color: #3b82f6; }
.check-row strong { display: block; color: #334155; font-size: 0.9rem; }
.check-row .sub-text { display: block; font-size: 0.8rem; color: #94a3b8; line-height: 1.3; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1rem; }
.btn-primary { background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: transparent; color: #64748b; padding: 12px 24px; border: none; cursor: pointer; }

/* SIGN CARD STYLES */
.card-header-centered { text-align: center; margin-bottom: 2rem; }
.icon-header { font-size: 3rem; margin-bottom: 10px; }
.segmented-control { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; margin-bottom: 20px; }
.segmented-control button { flex: 1; padding: 10px; border: none; background: transparent; border-radius: 8px; font-weight: 600; color: #64748b; cursor: pointer; transition: 0.2s; }
.segmented-control button.active { background: white; color: #2563eb; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.doc-preview-paper { height: 400px; overflow-y: auto; background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; font-family: 'Times New Roman', serif; line-height: 1.6; margin-bottom: 20px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.05); }
.actions-sticky { background: #f8fafc; padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f1f5f9; }
.btn-primary-large { background: #2563eb; color: white; padding: 14px 30px; border-radius: 10px; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(37,99,235,0.2); }
.btn-primary-large:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }
.modern-checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 8px; font-size: 0.9rem; }
.modern-checkbox input { display: none; }
.check-box { width: 22px; height: 22px; border: 2px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.2s; background: white; }
.modern-checkbox input:checked + .check-box { background: #2563eb; border-color: #2563eb; }
.modern-checkbox input:checked + .check-box::after { content: '✓'; color: white; font-weight: bold; }

/* WELCOME CARD */
.welcome-card { text-align: center; border-left: 5px solid #10b981; }
.status-badge { background: #dcfce7; color: #166534; padding: 5px 12px; border-radius: 20px; font-weight: bold; margin-top: 10px; display: inline-block; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
.doc-card { display: flex; align-items: center; gap: 15px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; padding: 1.5rem; }
.doc-card:hover { border-color: #bfdbfe; transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.doc-card .icon { font-size: 2rem; background: #eff6ff; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }

/* PDF MODAL */
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: white; width: 95%; max-width: 900px; height: 90vh; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; }
.modal-header { padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body-pdf { flex: 1; background: #e5e5e5; display: flex; justify-content: center; align-items: center; position: relative; }
.pdf-iframe { width: 100%; height: 100%; border: none; }

/* UTILS */
@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }
.spinner-small { width: 20px; height: 20px; border: 2px solid #ccc; border-top-color: #333; border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 5px; }
.loading-state { text-align: center; padding-top: 10vh; color: #64748b; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }

/* RESPONSIVE */
@media (max-width: 768px) {
  .desktop-menu, .desktop-actions { display: none; }
  .hamburger { display: flex; }
  .profile-grid, .edit-form-grid, .checkboxes-group { grid-template-columns: 1fr; }
  .actions-sticky { flex-direction: column; gap: 15px; align-items: stretch; }
  .btn-primary-large { width: 100%; }
}
</style>