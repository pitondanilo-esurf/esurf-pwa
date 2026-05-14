<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <div class="page-header-compact fade-in delay-1">
         <div class="header-left">
            <h2>{{ $t('resources.header.title') }}</h2>
            <p>{{ $t('resources.header.subtitle') }}</p>
         </div>
         <button class="btn-add-compact hover-scale" @click="goToOnboarding">
            {{ $t('resources.header.addBtn') }}
         </button>
      </div>

      <div class="content-area fade-in delay-2">
        
        <div v-if="loading" class="loading-state">
           <div class="spinner"></div><p>{{ $t('resources.status.loading') }}</p>
        </div>
        
        <div v-else class="pods-container">
            
            <div v-if="resources.length === 0" class="glass-card empty-state">
                <div class="empty-icon">📊</div>
                <h3>{{ $t('resources.empty.title') }}</h3>
                <p>{{ $t('resources.empty.desc') }}</p>
                <button @click="goToOnboarding" class="btn-primary mt-3">{{ $t('resources.empty.addNowBtn') }}</button>
            </div>
            
            <div v-else class="locations-wrapper">
                <div v-for="group in groupedResources" :key="group.address" class="location-group">
                    
                    <div class="location-header">
                        <h3 class="location-title"> {{ group.address }}</h3>
                        <span class="location-badge">
                            {{ group.items.length }} {{ group.items.length === 1 ? $t('resources.list.resourceSingular') : $t('resources.list.resourcePlural') }}
                        </span>
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
                            @open-lens="openLensPanel(resource)" 
                            @open-sign="openSignModal"
                            @open-qr="openQrModal"
                            @open-revoke="openRevokeModal"
                            @view-compliance="openComplianceModal"
                            @manage-assets="openAssetModal"     
                        />
                    </div>
                </div>
            </div>

        </div>
      </div>
    </main>

    <transition name="slide-panel">
        <div v-if="showLensPanel" class="side-panel-overlay" @click.self="closeLensPanel">
            <div class="side-panel">
                <div class="panel-header">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800;">
                            Lente {{ activeLensResource?.resource_type ? activeLensResource.resource_type.replace('_', ' ').toUpperCase() : 'ENERGIA' }}
                        </h3>
                        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: var(--text-muted); font-family: monospace;">
                            ID: <strong style="color: var(--accent-blue)">{{ activeLensResource?.pod_code || activeLensResource?.pdr_code || activeLensResource?.pdp_code }}</strong>
                        </p>
                    </div>
                    <button @click="closeLensPanel" class="btn-close-panel">✕</button>
                </div>
                
                <div class="panel-body">
                    <electricPower_lens 
                        v-if="!activeLensResource.resource_type || activeLensResource.resource_type === 'energia_elettrica'" 
                        :aiAnalysis="parseAiData(activeLensResource.ai_analysis)"
                    />
                    <gas_lens 
                        v-else-if="activeLensResource.resource_type === 'gas'" 
                        :aiAnalysis="parseAiData(activeLensResource.ai_analysis)"
                        :assets="activeLensResource.assets || []"
                    />
                    <water_lens 
                        v-else-if="activeLensResource.resource_type === 'acqua'" 
                        :aiAnalysis="parseAiData(activeLensResource.ai_analysis)"
                    />
                </div>
            </div>
        </div>
    </transition>

    <PodModify :show="showPodEditModal" :podData="selectedResource" @close="showPodEditModal = false" @saved="fetchResources"/>
    <PodAssetModal :show="showAssetModal" :pod="selectedPodForAssets" @close="closeAssetModal" @saved="fetchResources"/>
    <PdfViewerModal :show="showPdfModal" :url="currentPdfUrl" @close="closePdfModal"/>
    
    <PodAiModal v-if="activeResourceType === 'energia_elettrica'" :show="showAiModal" :aiData="activeAiData" @close="showAiModal = false" />
    <PdrAiModal v-if="activeResourceType === 'gas'" :show="showAiModal" :aiData="activeAiData" @close="showAiModal = false" />
    <WaterAiModal v-if="activeResourceType === 'acqua'" :show="showAiModal" :aiData="activeAiData" @close="showAiModal = false" />

    <ResourceComplianceModal :show="showComplianceModal" :complianceData="selectedComplianceData" @close="showComplianceModal = false"/>

    <transition name="modal-fade">
        <div v-if="showSignModal" class="modal-backdrop" @click.self="showSignModal = false">
            <div class="glass-modal preview-modal">
                <div class="modal-header">
                    <h3>{{ $t('resources.signModal.title') }}</h3>
                    <button @click="showSignModal = false" class="btn-close-modal" :title="$t('resources.actions.close')">✕</button>
                </div>
                
                <div class="modal-body" v-if="activeResource">
                    <p class="text-muted mb-2">
                        {{ $t('resources.signModal.resourceLabel') }} <strong style="color: var(--accent-blue)">{{ activeResource.pod_code || activeResource.pdr_code || activeResource.pdp_code }}</strong> 
                        ({{ activeResource.resource_type ? activeResource.resource_type.replace('_', ' ') : $t('resources.signModal.defaultType') }})
                    </p>

                    <div class="doc-tabs">
                        <button :class="{ active: currentDocType === 'delegation' }" @click="loadPreview('delegation')">{{ $t('resources.signModal.tabDelegation') }}</button>
                        <button :class="{ active: currentDocType === 'policy' }" @click="loadPreview('policy')">{{ $t('resources.signModal.tabPolicy') }}</button>
                    </div>

                    <div class="html-preview-box">
                        <div v-if="previewLoading" class="preview-loading">
                            <div class="spinner-small"></div>
                            <p>{{ $t('resources.signModal.loadingDoc') }}</p>
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
                            {{ $t('resources.signModal.acceptDelegation') }}
                        </label>
                        <label class="check-container">
                            <input type="checkbox" v-model="signForm.accept_data_policy">
                            {{ $t('resources.signModal.acceptPolicy') }}
                        </label>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button @click="showSignModal = false" class="btn-ghost-small">{{ $t('resources.actions.cancel') }}</button>
                        <button @click="confirmSignature" class="btn-primary" :disabled="isSigning || !signForm.accept_delegation || !signForm.accept_data_policy">
                            {{ isSigning ? $t('resources.signModal.signing') : $t('resources.signModal.signBtn') }}
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
                    <h3>{{ $t('resources.qrModal.title') }}</h3>
                    <button @click="showQrModal = false" class="btn-close-modal" :title="$t('resources.actions.close')">✕</button>
                </div>
                <div class="modal-body text-center" v-if="activeResource">
                    <p class="text-muted mb-3">{{ $t('resources.qrModal.instruction') }} <strong>{{ activeResource.pod_code || activeResource.pdr_code || activeResource.pdp_code }}</strong>.</p>
                    <div class="qr-placeholder">
                        <img :src="getQrUrl(activeResource)" alt="QR Code" />
                    </div>
                </div>
                <div class="modal-footer justify-center">
                    <button @click="showQrModal = false" class="btn-ghost-small">{{ $t('resources.actions.close') }}</button>
                </div>
            </div>
        </div>
    </transition>

    <transition name="modal-fade">
        <div v-if="showRevokeModal" class="modal-backdrop" @click.self="showRevokeModal = false">
            <div class="glass-modal" style="max-width: 450px;">
                <div class="modal-header">
                    <h3 class="text-error">{{ $t('resources.revokeModal.title') }}</h3>
                    <button @click="showRevokeModal = false" class="btn-close-modal">✕</button>
                </div>
                <div class="modal-body" v-if="activeResource">
                    <p>{{ $t('resources.revokeModal.prompt') }} <strong>{{ activeResource.pod_code || activeResource.pdr_code || activeResource.pdp_code }}</strong>?</p>
                    <div class="alert alert-error mt-3">
                        <strong>{{ $t('resources.revokeModal.warningLabel') }}</strong> {{ $t('resources.revokeModal.warningDesc') }}
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="showRevokeModal = false" class="btn-ghost-small">{{ $t('resources.actions.cancel') }}</button>
                    <button @click="confirmRevocation" class="btn-primary" style="background: #ef4444;" :disabled="isRevoking">
                        {{ isRevoking ? $t('resources.revokeModal.revoking') : $t('resources.revokeModal.confirmBtn') }}
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
import { useI18n } from 'vue-i18n';
import axios from '@/services/axios'; 
import GuideHeader from '@/components/layout/GuideHeader.vue';

// Importazione dei sotto-componenti
import ResourceAccordionItem from '@/components/resources/ResourceAccordionItem.vue';
import PodModify from '@/components/pods/PodModify.vue';
import PodAssetModal from '@/components/pods/PodAssetModal.vue';
import PdfViewerModal from '@/components/common/PdfViewerModal.vue';

import PodAiModal from '@/components/pods/PodAiModal.vue';
import PdrAiModal from '@/components/pods/PdrAiModal.vue';
import WaterAiModal from '@/components/pods/WaterAiModal.vue';
import ResourceComplianceModal from '@/components/resources/ResourceComplianceModal.vue';

// Importazione delle lenti
import electricPower_lens from '@/components/lenses/electricPower_lens.vue';
import gas_lens from '@/components/lenses/gas_lens.vue';
import water_lens from '@/components/lenses/water_lens.vue';

const router = useRouter();
const { t } = useI18n();

// --- STATO GLOBALE ---
const isLightMode = ref(false);
const loading = ref(true);
const resources = ref([]);
const expandedId = ref(null);

// --- STATO SIDE PANEL (DRAWER) ---
const showLensPanel = ref(false);
const activeLensResource = ref(null);

const openLensPanel = (resource) => {
    activeLensResource.value = resource;
    showLensPanel.value = true;
    // Blocca lo scroll del body dietro al pannello
    document.body.style.overflow = 'hidden'; 
};

const closeLensPanel = () => {
    showLensPanel.value = false;
    document.body.style.overflow = ''; // Ripristina lo scroll
    setTimeout(() => { activeLensResource.value = null; }, 300); // Attende fine animazione
};

// Funzione helper per parsare i dati dell'AI (utilizzata dalle lenti)
const parseAiData = (data) => {
    if (!data) return null;
    try {
        return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
        return null;
    }
};

// --- RAGGRUPPAMENTO RISORSE PER INDIRIZZO (AI + Fuzzy) ---
const groupedResources = computed(() => {
    const groups = {};
    
    resources.value.forEach(r => {
        let aiData = {};
        try {
            aiData = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : (r.ai_analysis || {});
        } catch (e) {}

        const aiAddr = aiData?.indirizzo || {};
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
            displayAddress = displayCity || displayStreet || t('resources.list.unknownLocation');
        }
        
        displayAddress = displayAddress.replace(/\s+/g, ' ').trim();

        let normKey = `${citta} ${via}`.toLowerCase();
        normKey = normKey.replace(/[^\w\s]/gi, ' ');
        normKey = normKey.replace(/\b(di|del|della|dei|degli|via|viale|piazza|corso)\b/g, ' ');
        normKey = normKey.replace(/\b[a-z]{2}\b/g, ' ');
        normKey = normKey.replace(/\d+/g, ' ');
        normKey = normKey.replace(/\s+/g, ' ').trim();

        if (!normKey) normKey = 'unknown_location';

        if (!groups[normKey]) {
            groups[normKey] = { address: displayAddress, items: [] };
        } else {
            if (displayAddress.length > groups[normKey].address.length) {
                groups[normKey].address = displayAddress;
            }
        }
        groups[normKey].items.push(r);
    });

    return Object.values(groups).sort((a, b) => a.address.localeCompare(b.address));
});

// --- STATI MODALI ---
const selectedResource = ref(null);
const showPodEditModal = ref(false);

const openForm = (resource = null) => {
    selectedResource.value = resource; 
    if (!resource.resource_type || resource.resource_type === 'energia_elettrica') {
        showPodEditModal.value = true;
    } else if (resource.resource_type === 'gas') {
        alert(t('resources.alerts.gasEditComingSoon'));
    } else if (resource.resource_type === 'acqua') {
        alert(t('resources.alerts.waterEditComingSoon'));
    }
};

const showAssetModal = ref(false);
const selectedPodForAssets = ref(null);
const openAssetModal = (resource) => { selectedPodForAssets.value = resource; showAssetModal.value = true; };
const closeAssetModal = () => { showAssetModal.value = false; setTimeout(() => { selectedPodForAssets.value = null; }, 300); };

const showPdfModal = ref(false);
const currentPdfUrl = ref('');

const showAiModal = ref(false);
const activeAiData = ref(null);
const activeResourceType = ref('energia_elettrica');

const showComplianceModal = ref(false);
const selectedComplianceData = ref(null);
const openComplianceModal = (data) => { selectedComplianceData.value = data; showComplianceModal.value = true; };

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
const openRevokeModal = (resource) => { activeResource.value = resource; showRevokeModal.value = true; };

const confirmRevocation = async () => {
    isRevoking.value = true;
    try {
        await axios.post(`/api/resources/${activeResource.value.id}/revoke`, { type: activeResource.value.resource_type });
        showRevokeModal.value = false;
        fetchResources(); 
    } catch (error) {
        alert(t('resources.alerts.revokeError'));
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
        resources.value = [];
    } finally {
        loading.value = false;
    }
};

const deleteResource = async (resource) => {
    const code = resource.pod_code || resource.pdr_code || resource.pdp_code;
    if (!confirm(t('resources.alerts.deleteConfirm', { code }))) return;
    try {
        await axios.delete(`/api/resources/${resource.id}?type=${resource.resource_type}`);
        await fetchResources();
    } catch (error) {
        alert(t('resources.alerts.deleteError'));
    }
};

const goToOnboarding = () => { router.push('/onboarding-risorse'); };
const toggleAccordion = (id) => { expandedId.value = expandedId.value === id ? null : id; };

const openPdfModal = async (payload) => {
    const { doc, resource } = payload;
    currentPdfUrl.value = '';
    showPdfModal.value = true;
    try {
        const response = await axios.get(`/api/legal/download-resource/${resource.id}?type=${resource.resource_type}&doc=${doc}`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        currentPdfUrl.value = window.URL.createObjectURL(blob);
    } catch (error) {
        alert(t('resources.alerts.pdfLoadError'));
        showPdfModal.value = false;
    }
};

const closePdfModal = () => {
    showPdfModal.value = false;
    if (currentPdfUrl.value && currentPdfUrl.value.startsWith('blob:')) window.URL.revokeObjectURL(currentPdfUrl.value); 
    currentPdfUrl.value = '';
};

const openAiModal = (resource) => {
    try {
        activeAiData.value = typeof resource.ai_analysis === 'string' ? JSON.parse(resource.ai_analysis) : resource.ai_analysis;
        activeResourceType.value = resource.resource_type || 'energia_elettrica';
        showAiModal.value = true;
    } catch (e) {
        alert(t('resources.alerts.aiReadError'));
    }
};

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
        previewHtml.value = `<div style="color:red; text-align:center; padding: 20px;">${t('resources.signModal.previewError')}</div>`;
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

const openQrModal = (resource) => { activeResource.value = resource; showQrModal.value = true; };

const getQrUrl = (resource) => {
    if (!resource) return '';
    const hash = resource.public_share_hash || resource.id;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/querypods?id=' + hash)}`;
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
        signSuccess.value = t('resources.alerts.signSuccess');
        setTimeout(() => { showSignModal.value = false; fetchResources(); }, 2000);
    } catch (error) {
        signError.value = error.response?.data?.message || t('resources.alerts.signError');
    } finally {
        isSigning.value = false;
    }
};
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* --- STILI BASE LAYOUT COMPATTO --- */
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1rem 4rem 1rem; max-width: 1000px; margin: 0 auto; }

/* HEADER PAGINA */
.page-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; gap: 10px; }
.page-header-compact h2 { margin: 0; font-size: 1.3rem; font-weight: 700; letter-spacing: -0.5px; }
.page-header-compact p { margin: 2px 0 0 0; color: var(--text-muted); font-size: 0.8rem; }
.btn-add-compact { background-color: var(--accent-blue); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; white-space: nowrap; }
.btn-add-compact:hover { background-color: var(--accent-cyan); }

/* STATI (Loading / Empty) */
.loading-state, .empty-state { text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.9rem; }
.spinner { width: 24px; height: 24px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.empty-icon { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; }

/* GRUPPI INDIRIZZO */
.location-group { margin-bottom: 30px; }
.location-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 4px; border-bottom: 2px solid var(--border-color); }
.location-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 6px; }
.location-badge { background: var(--accent-blue); color: white; font-size: 0.65rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.accordion-container { display: flex; flex-direction: column; gap: 8px; margin-left: 4px;}

/* --- NUOVO STILE: SIDE PANEL (DRAWER) --- */
.side-panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 10000; /* Sopra la navbar */
    display: flex;
    justify-content: flex-end; /* Allinea a destra */
}

.side-panel {
    width: 100%;
    max-width: 500px; /* Larghezza desktop */
    background: var(--bg-card);
    height: 100vh;
    display: flex;
    flex-direction: column;
    box-shadow: -10px 0 30px rgba(0,0,0,0.2);
}

.panel-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-card);
}

.btn-close-panel {
    background: rgba(100, 116, 139, 0.1);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--text-muted);
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close-panel:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: var(--bg-app);
}

/* --- ANIMAZIONE SCORRIMENTO LATERALE --- */
.slide-panel-enter-active, .slide-panel-leave-active {
    transition: opacity 0.3s ease;
}
.slide-panel-enter-active .side-panel, .slide-panel-leave-active .side-panel {
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); /* Curva fluida tipo iOS */
}

.slide-panel-enter-from { opacity: 0; }
.slide-panel-enter-from .side-panel { transform: translateX(100%); }

.slide-panel-leave-to { opacity: 0; }
.slide-panel-leave-to .side-panel { transform: translateX(100%); }

/* ANIMAZIONI DI BASE */
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.1s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* --- STILE MODALI VECCHIE (Invariato) --- */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.glass-modal { background: var(--bg-card, #ffffff); width: 95%; max-width: 500px; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden; display: flex; flex-direction: column; }
.qr-modal { max-width: 400px; }
.modal-header { padding: 1rem 1.2rem; border-bottom: 1px solid var(--border-color, #e5e7eb); display: flex; justify-content: space-between; align-items: center; background: var(--bg-app, #f8fafc); }
.modal-header h3 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-main, #1e293b); }
.btn-close-modal { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted, #64748b); transition: 0.2s; }
.modal-body { padding: 1.2rem; color: var(--text-main, #1e293b); font-size: 0.9rem; }
.text-center { text-align: center; }
.text-muted { color: var(--text-muted, #64748b); }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-3 { margin-top: 1rem; }
.modal-footer { padding: 0.8rem 1.2rem; border-top: 1px solid var(--border-color, #e5e7eb); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-app, #f8fafc); }
.justify-center { justify-content: center; }
.btn-ghost-small { background: var(--bg-card, #ffffff); border: 1px solid var(--border-color, #e5e7eb); padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; color: var(--text-main, #1e293b); }
.alert { padding: 10px; border-radius: 6px; font-size: 0.85rem; }
.alert-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
.alert-success { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.qr-placeholder { background: white; padding: 15px; border-radius: 8px; display: inline-block; }
.qr-placeholder img { width: 180px; height: 180px; display: block; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.preview-modal { max-width: 700px !important; }
.doc-tabs { display: flex; gap: 5px; margin-top: 10px; border-bottom: 2px solid var(--border-color); }
.doc-tabs button { background: none; border: none; padding: 8px 15px; font-weight: 600; font-size: 0.85rem; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.doc-tabs button.active { color: var(--accent-blue); border-bottom-color: var(--accent-blue); }
.html-preview-box { margin-top: 10px; background: white; border: 1px solid var(--border-color); border-radius: 6px; padding: 15px; height: 40vh; overflow-y: auto; color: #333; }
.preview-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 0.85rem; }
.legal-checks { background: var(--bg-card); padding: 10px; border-radius: 6px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 8px; }
.check-container { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: var(--text-main); cursor: pointer; }
.check-container input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }

@media (max-width: 768px) {
    .page-header-compact { flex-direction: row; flex-wrap: wrap; }
    .btn-add-compact { width: 100%; justify-content: center; padding: 10px; }
}

@media (max-width: 600px) {
    /* Su mobile il drawer prende tutto lo schermo */
    .side-panel {
        max-width: 100%; 
    }
}
</style>