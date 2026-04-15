<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <div class="page-header-compact fade-in delay-1">
         <div class="header-left">
            <h2>Gestione Risorse</h2>
            <p>Gestisci i tuoi contatori Luce, Gas e Acqua</p>
         </div>
         <button class="btn-add-compact hover-scale" @click="goToOnboarding">
            + Aggiungi Risorsa
         </button>
      </div>

      <div class="content-area fade-in delay-2">
        
        <div v-if="loading" class="loading-state">
           <div class="spinner"></div><p>Caricamento risorse...</p>
        </div>
        
        <div v-else class="pods-container">
            
            <div v-if="resources.length === 0" class="glass-card empty-state">
                <div class="empty-icon">📊</div>
                <h3>Nessuna risorsa trovata</h3>
                <p>Inizia aggiungendo il tuo primo contatore di luce, gas o acqua.</p>
                <button @click="goToOnboarding" class="btn-primary mt-3">Aggiungi ora</button>
            </div>
            
            <div v-else class="locations-wrapper">
                <div v-for="group in groupedResources" :key="group.address" class="location-group">
                    
                    <div class="location-header">
                        <h3 class="location-title">📍 {{ group.address }}</h3>
                        <span class="location-badge">{{ group.items.length }} {{ group.items.length === 1 ? 'Risorsa' : 'Risorse' }}</span>
                    </div>

                    <div class="accordion-container">
                        <ResourceAccordionItem 
                            v-for="resource in group.items" 
                            :key="resource.id" 
                            :resource="resource"
                            :isOpen="expandedId === resource.id"
                            @toggle="toggleAccordion(resource.id)"
                            @edit="openForm(resource)"
                            @delete="deleteResource"
                            @view-pdf="openPdfModal"
                            @view-ai="openAiModal"
                            @open-sign="openSignModal"
                            @open-qr="openQrModal"
                            @open-revoke="openRevokeModal"
                            @view-compliance="openComplianceModal"     
                        />
                    </div>
                </div>
            </div>

        </div>
      </div>
    </main>

    <ResourceFormModal 
        :show="showFormModal"
        :resourceToEdit="selectedResource"
        @close="showFormModal = false"
        @saved="fetchResources"
    />

    <PdfViewerModal
        :show="showPdfModal"
        :url="currentPdfUrl"
        @close="closePdfModal"
    />

    <PodAiModal 
        v-if="activeResourceType === 'energia_elettrica'"
        :show="showAiModal" 
        :aiData="activeAiData" 
        @close="showAiModal = false" 
    />
    <PdrAiModal 
        v-if="activeResourceType === 'gas'"
        :show="showAiModal" 
        :aiData="activeAiData" 
        @close="showAiModal = false" 
    />
    <WaterAiModal 
        v-if="activeResourceType === 'acqua'"
        :show="showAiModal" 
        :aiData="activeAiData" 
        @close="showAiModal = false" 
    />

    <ResourceComplianceModal 
        :show="showComplianceModal"
        :complianceData="selectedComplianceData"
        @close="showComplianceModal = false"
    />

    <transition name="modal-fade">
        <div v-if="showSignModal" class="modal-backdrop" @click.self="showSignModal = false">
            <div class="glass-modal preview-modal">
                <div class="modal-header">
                    <h3>Firma Documenti Legali</h3>
                    <button @click="showSignModal = false" class="btn-close-modal" title="Chiudi">✕</button>
                </div>
                
                <div class="modal-body" v-if="activeResource">
                    <p class="text-muted mb-2">
                        Risorsa: <strong style="color: var(--accent-blue)">{{ activeResource.pod_code || activeResource.pdr_code || activeResource.pdp_code }}</strong> 
                        ({{ activeResource.resource_type ? activeResource.resource_type.replace('_', ' ') : 'Energia Elettrica' }})
                    </p>

                    <div class="doc-tabs">
                        <button 
                            :class="{ active: currentDocType === 'delegation' }" 
                            @click="loadPreview('delegation')">
                            📄 Mandato / Delega
                        </button>
                        <button 
                            :class="{ active: currentDocType === 'policy' }" 
                            @click="loadPreview('policy')">
                            🔒 Informativa Privacy
                        </button>
                    </div>

                    <div class="html-preview-box">
                        <div v-if="previewLoading" class="preview-loading">
                            <div class="spinner-small"></div>
                            <p>Caricamento documento in corso...</p>
                        </div>
                        <div v-else v-html="previewHtml" class="html-content"></div>
                    </div>

                    <div v-if="signError" class="alert alert-error mt-3">{{ signError }}</div>
                    <div v-if="signSuccess" class="alert alert-success mt-3">{{ signSuccess }}</div>
                </div>

                <div class="modal-footer" style="flex-direction: column; align-items: stretch; gap: 15px;">
                    <div class="legal-checks">
                        <label class="check-container">
                            <input type="checkbox" v-model="signForm.accept_delegation">
                            Dichiaro di aver letto e accettato il Mandato / Delega di lettura.
                        </label>
                        <label class="check-container">
                            <input type="checkbox" v-model="signForm.accept_data_policy">
                            Dichiaro di aver letto e accettato l'Informativa sul Trattamento dei Dati.
                        </label>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button @click="showSignModal = false" class="btn-ghost-small">Annulla</button>
                        <button 
                            @click="confirmSignature" 
                            class="btn-primary" 
                            :disabled="isSigning || !signForm.accept_delegation || !signForm.accept_data_policy">
                            {{ isSigning ? 'Firma in corso...' : '✍️ Firma Entrambi i Documenti' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>

    <transition name="modal-fade">
        <div v-if="showQrModal" class="modal-backdrop" @click.self="showQrModal = false">
            <div class="glass-modal qr-modal">
                <div class="modal-header">
                    <h3>QR Code Risorsa</h3>
                    <button @click="showQrModal = false" class="btn-close-modal" title="Chiudi">✕</button>
                </div>
                <div class="modal-body text-center" v-if="activeResource">
                    <p class="text-muted mb-3">Inquadra il QR Code per accedere rapidamente alla risorsa <strong>{{ activeResource.pod_code || activeResource.pdr_code || activeResource.pdp_code }}</strong>.</p>
                    
                    <div class="qr-placeholder">
                        <img :src="getQrUrl(activeResource)" alt="QR Code" />
                    </div>
                    
                </div>
                <div class="modal-footer justify-center">
                    <button @click="showQrModal = false" class="btn-ghost-small">Chiudi</button>
                </div>
            </div>
        </div>
    </transition>

    <transition name="modal-fade">
        <div v-if="showRevokeModal" class="modal-backdrop" @click.self="showRevokeModal = false">
            <div class="glass-modal" style="max-width: 450px;">
                <div class="modal-header">
                    <h3 class="text-error">Revoca Mandato</h3>
                    <button @click="showRevokeModal = false" class="btn-close-modal">✕</button>
                </div>
                <div class="modal-body" v-if="activeResource">
                    <p>Sei sicuro di voler revocare il mandato per la risorsa <strong>{{ activeResource.pod_code || activeResource.pdr_code || activeResource.pdp_code }}</strong>?</p>
                    <div class="alert alert-error mt-3">
                        <strong>Attenzione:</strong> La revoca disabiliterà l'aggiornamento automatico dei dati e l'analisi IA per questa fornitura.
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="showRevokeModal = false" class="btn-ghost-small">Annulla</button>
                    <button @click="confirmRevocation" class="btn-primary" style="background: #ef4444;" :disabled="isRevoking">
                        {{ isRevoking ? 'Revoca in corso...' : 'Conferma Revoca' }}
                    </button>
                </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios'; 
import GuideHeader from '@/components/layout/GuideHeader.vue';

// Importazione dei nuovi sotto-componenti
import ResourceAccordionItem from '@/components/resources/ResourceAccordionItem.vue';
import ResourceFormModal from '@/components/resources/ResourceFormModal.vue';
import PdfViewerModal from '@/components/common/PdfViewerModal.vue';

// Importazione Modali AI
import PodAiModal from '@/components/pods/PodAiModal.vue';
import PdrAiModal from '@/components/pods/PdrAiModal.vue';
import WaterAiModal from '@/components/pods/WaterAiModal.vue';
import ResourceComplianceModal from '@/components/resources/ResourceComplianceModal.vue';

const router = useRouter();

// --- STATO GLOBALE ---
const isLightMode = ref(false);
const loading = ref(true);
const resources = ref([]);
const expandedId = ref(null);

// --- RAGGRUPPAMENTO RISORSE PER INDIRIZZO (AI + Fuzzy) ---
const groupedResources = computed(() => {
    const groups = {};
    
    resources.value.forEach(r => {
        // 1. Estrazione dati AI
        let aiData = {};
        try {
            aiData = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : (r.ai_analysis || {});
        } catch (e) {
            console.warn("Errore parsing ai_analysis per la risorsa", r.id);
        }

        const aiAddr = aiData?.indirizzo || {};
        
        // 2. Costruzione indirizzo pulito
        const via = aiAddr.Via ? aiAddr.Via.trim() : (r.address ? r.address.trim() : '');
        const civico = aiAddr.NumeroCivico ? aiAddr.NumeroCivico.trim() : '';
        const citta = aiAddr.Città ? aiAddr.Città.trim() : (r.city ? r.city.trim() : '');
        const prov = aiAddr.Provincia ? aiAddr.Provincia.trim() : (r.province ? r.province.trim() : '');
        
        let displayCity = `${citta} ${prov ? '('+prov+')' : ''}`.trim();
        let displayStreet = `${via} ${civico}`.trim();
        
        let displayAddress = '';
        if (displayCity && displayStreet) {
            displayAddress = `${displayCity}, ${displayStreet}`;
        } else {
            displayAddress = displayCity || displayStreet || 'Indirizzo non specificato';
        }
        
        displayAddress = displayAddress.replace(/\s+/g, ' ').trim();

        // 3. NORMALIZZAZIONE FUZZY
        let normKey = `${citta} ${via}`.toLowerCase();
        
        normKey = normKey.replace(/[^\w\s]/gi, ' ');
        normKey = normKey.replace(/\b(di|del|della|dei|degli|via|viale|piazza|corso)\b/g, ' ');
        normKey = normKey.replace(/\b[a-z]{2}\b/g, ' ');
        normKey = normKey.replace(/\d+/g, ' ');
        normKey = normKey.replace(/\s+/g, ' ').trim();

        if (!normKey) normKey = 'unknown_location';

        // 4. Raggruppa e tiene l'indirizzo più "dettagliato"
        if (!groups[normKey]) {
            groups[normKey] = {
                address: displayAddress, 
                items: []
            };
        } else {
            if (displayAddress.length > groups[normKey].address.length) {
                groups[normKey].address = displayAddress;
            }
        }

        groups[normKey].items.push(r);
    });

    return Object.values(groups).sort((a, b) => a.address.localeCompare(b.address));
});

// --- STATO MODALI ---
const showFormModal = ref(false);
const selectedResource = ref(null);

const showPdfModal = ref(false);
const currentPdfUrl = ref('');

const showAiModal = ref(false);
const activeAiData = ref(null);
const activeResourceType = ref('energia_elettrica');

// COMPLIANCE ---
const showComplianceModal = ref(false);
const selectedComplianceData = ref(null);

const openComplianceModal = (data) => {
    selectedComplianceData.value = data;
    showComplianceModal.value = true;
};
// ------------------------------------------------

// --- STATO AZIONI AGGIUNTIVE (Firma & QR) ---
const showSignModal = ref(false);
const showQrModal = ref(false);
const activeResource = ref(null);
const isSigning = ref(false);
const signError = ref('');
const signSuccess = ref('');

const currentDocType = ref('delegation');
const previewHtml = ref('');
const previewLoading = ref(false);
const signForm = ref({ accept_delegation: false, accept_data_policy: false });

const showRevokeModal = ref(false);
const isRevoking = ref(false);

const openRevokeModal = (resource) => {
    activeResource.value = resource;
    showRevokeModal.value = true;
};

const confirmRevocation = async () => {
    isRevoking.value = true;
    try {
        await axios.post(`/api/resources/${activeResource.value.id}/revoke`, {
            type: activeResource.value.resource_type
        });
        
        showRevokeModal.value = false;
        fetchResources(); 
    } catch (error) {
        alert("Errore durante la revoca del mandato.");
    } finally {
        isRevoking.value = false;
    }
};

// --- INIT ---
onMounted(() => {
    const savedTheme = localStorage.getItem('theme');
    isLightMode.value = savedTheme === 'light';
    if (isLightMode.value) document.body.classList.add('light-mode');
    
    fetchResources();
});

// --- API FETCH & DELETE ---
const fetchResources = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/api/resources'); 
        resources.value = response.data.data || response.data || [];
    } catch (error) {
        console.warn("Nessuna risorsa trovata o errore di connessione:", error.message);
        resources.value = [];
    } finally {
        loading.value = false;
    }
};

const deleteResource = async (resource) => {
    const code = resource.pod_code || resource.pdr_code || resource.pdp_code;
    if (!confirm(`Sei sicuro di voler eliminare la risorsa ${code}?`)) return;
    try {
        await axios.delete(`/api/resources/${resource.id}?type=${resource.resource_type}`);
        await fetchResources();
    } catch (error) {
        alert("Errore durante l'eliminazione.");
    }
};

// --- METODI NAVIGAZIONE & UI ---
const goToOnboarding = () => {
    router.push('/onboarding-risorse');
};

const toggleAccordion = (id) => {
    expandedId.value = expandedId.value === id ? null : id;
};

const openForm = (resource = null) => {
    selectedResource.value = resource; 
    showFormModal.value = true;
};

// --- GESTIONE VISUALIZZAZIONE PDF PROTETTI ---
const openPdfModal = async (payload) => {
    const { doc, resource } = payload;
    
    currentPdfUrl.value = '';
    showPdfModal.value = true;

    try {
        const response = await axios.get(
            `/api/legal/download-resource/${resource.id}?type=${resource.resource_type}&doc=${doc}`, 
            { responseType: 'blob' }
        );
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        currentPdfUrl.value = window.URL.createObjectURL(blob);
    } catch (error) {
        console.error("Errore download PDF:", error);
        alert("Impossibile caricare il documento.");
        showPdfModal.value = false;
    }
};

const closePdfModal = () => {
    showPdfModal.value = false;
    if (currentPdfUrl.value && currentPdfUrl.value.startsWith('blob:')) {
        window.URL.revokeObjectURL(currentPdfUrl.value); 
    }
    currentPdfUrl.value = '';
};

const openAiModal = (resource) => {
    try {
        activeAiData.value = typeof resource.ai_analysis === 'string' ? JSON.parse(resource.ai_analysis) : resource.ai_analysis;
        activeResourceType.value = resource.resource_type || 'energia_elettrica';
        showAiModal.value = true;
    } catch (e) {
        alert("Impossibile leggere i dati dell'Intelligenza Artificiale.");
    }
};

// --- METODI AZIONI (FIRMA E QR) ---
const loadPreview = async (tab) => {
    currentDocType.value = tab;
    previewLoading.value = true;
    previewHtml.value = '';

    let apiEndpointType = '';
    
    if (tab === 'delegation') {
        const rType = activeResource.value?.resource_type;
        if (rType === 'gas') apiEndpointType = 'delegation_gas_read';
        else if (rType === 'acqua') apiEndpointType = 'delegation_water_read';
        else apiEndpointType = 'delegation_pod_read';
    } else {
        apiEndpointType = 'data_usage_policy';
    }

    try {
        const code = activeResource.value?.pod_code || activeResource.value?.pdr_code || activeResource.value?.pdp_code || 'ND';
        const response = await axios.get(`/api/legal/preview/${apiEndpointType}?pod_code=${code}`);
        previewHtml.value = response.data.html_content;
    } catch (e) {
        console.error("Errore fetch anteprima:", e);
        previewHtml.value = `<div style="color:red; text-align:center; padding: 20px;">
                                ⚠️ Impossibile caricare l'anteprima. Il documento verrà comunque generato con i tuoi dati reali al momento della firma.
                             </div>`;
    } finally {
        previewLoading.value = false;
    }
};

const openSignModal = (resource) => {
    activeResource.value = resource;
    signError.value = '';
    signSuccess.value = '';
    signForm.value = { accept_delegation: false, accept_data_policy: false };
    showSignModal.value = true;
    loadPreview('delegation');
};

const openQrModal = (resource) => {
    activeResource.value = resource;
    showQrModal.value = true;
};

const getQrUrl = (resource) => {
    if (!resource) return '';
    const hash = resource.public_share_hash || resource.id;
    const baseUrl = window.location.origin;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(baseUrl + '/querypods?id=' + hash)}`;
};

const confirmSignature = async () => {
    isSigning.value = true;
    signError.value = '';
    signSuccess.value = '';

    try {
        await axios.post('/api/legal/sign-pod', {
            resource_id: activeResource.value.id,
            pod_id: activeResource.value.id, 
            resource_type: activeResource.value.resource_type,
            pod_code: activeResource.value.pod_code || activeResource.value.pdr_code || activeResource.value.pdp_code,
            accept_delegation: 'accepted',
            accept_data_policy: 'accepted'
        });

        signSuccess.value = 'Documenti firmati con successo!';
        
        setTimeout(() => {
            showSignModal.value = false;
            fetchResources(); 
        }, 2000);

    } catch (error) {
        console.error("Errore firma:", error);
        signError.value = error.response?.data?.message || 'Errore durante la firma del documento.';
    } finally {
        isSigning.value = false;
    }
};

</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* --- STILI BASE LAYOUT --- */
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1.5rem 4rem 1.5rem; max-width: 1000px; margin: 0 auto; }

.page-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-header-compact h2 { margin: 0; font-size: 1.8rem; font-weight: 800; }
.page-header-compact p { margin: 5px 0 0 0; color: var(--text-muted); }

.loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.spinner { width: 30px; height: 30px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.btn-add-compact { background-color: var(--accent-blue); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-primary { background-color: var(--accent-blue); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background-color: var(--accent-cyan); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.hover-scale:hover { transform: scale(1.05); }

.fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* --- GRUPPI INDIRIZZO --- */
.location-group {
    margin-bottom: 30px;
}
.location-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border-color);
}
.location-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 8px;
}
.location-badge {
    background: var(--accent-blue);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
}

/* --- STILI MODALI --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.glass-modal {
  background: var(--bg-card, #ffffff);
  width: 95%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.qr-modal { max-width: 400px; }
.modal-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-app, #f8fafc);
}
.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main, #1e293b);
}
.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted, #64748b);
  transition: 0.2s;
}
.btn-close-modal:hover { color: #ef4444; transform: scale(1.1); }
.modal-body { padding: 1.5rem; color: var(--text-main, #1e293b); }
.text-center { text-align: center; }
.text-muted { color: var(--text-muted, #64748b); }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-3 { margin-top: 1rem; }
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: var(--bg-app, #f8fafc);
}
.justify-center { justify-content: center; }
.btn-ghost-small {
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-main, #1e293b);
  transition: 0.2s;
}
.btn-ghost-small:hover { border-color: var(--text-muted, #64748b); }

.alert { padding: 12px; border-radius: 8px; font-size: 0.9rem; }
.alert-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
.alert-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }

.qr-placeholder { background: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.qr-placeholder img { width: 200px; height: 200px; display: block; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* --- STILI ANTEPRIMA DOCUMENTI --- */
.preview-modal { max-width: 700px !important; }
.doc-tabs { display: flex; gap: 5px; margin-top: 15px; border-bottom: 2px solid var(--border-color); }
.doc-tabs button {
    background: none; border: none; padding: 10px 20px; font-weight: 600; color: var(--text-muted);
    cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s;
}
.doc-tabs button:hover { color: var(--accent-blue); }
.doc-tabs button.active { color: var(--accent-blue); border-bottom-color: var(--accent-blue); }
.html-preview-box {
    margin-top: 15px; background: white; border: 1px solid var(--border-color);
    border-radius: 8px; padding: 20px; height: 40vh; overflow-y: auto;
    color: #333; box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
}
.preview-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); }
.legal-checks { background: var(--bg-card); padding: 15px; border-radius: 8px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 10px; }
.check-container { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: var(--text-main); cursor: pointer; }
.check-container input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }

</style>