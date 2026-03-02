<template>
  <div class="app-container">
    
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
        <header class="page-header-compact fade-in delay-1" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <div class="header-left">
                <h2 style="margin:0; font-size: 1.8rem;">{{ $t('ownerCommunity.title') }}</h2>
                <p style="margin: 5px 0 0 0; color: var(--text-muted);">{{ $t('ownerCommunity.subtitle') }}</p>
            </div>
            <button @click="$router.push('/owner/dashboard')" class="btn-ghost-small">
                {{ $t('ownerCommunity.backToDash') }}
            </button>
        </header>

        <div class="content-area fade-in delay-2">
            
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>{{ $t('ownerCommunity.loading') }}</p>
            </div>

            <div v-else-if="Object.keys(groupedPods).length === 0" class="card empty-state">
                <div class="empty-icon">🏢</div>
                <p>{{ $t('ownerCommunity.empty') }}</p>
            </div>

            <div v-else class="substations-container">
                <div 
                    v-for="(podsList, substation) in groupedPods" 
                    :key="substation" 
                    class="card substation-card"
                >
                    <div class="card-header substation-header">
                        <div class="substation-title">
                            <span class="icon">🏢</span>
                            <h3>{{ substation === 'unassigned' ? $t('ownerCommunity.unassigned') : substation }}</h3>
                        </div>
                        <span class="badge">{{ podsList.length }} POD</span>
                    </div>
                    
                    <div class="accordion-container" style="padding: 15px;">
                        <div v-for="pod in podsList" :key="pod.id" class="accordion-item" :class="{ 'is-open': expandedPodId === pod.id }">
                            
                            <div class="accordion-header" @click="toggleAccordion(pod.id)">
                                <div class="header-main-info">
                                    <div 
                                        class="compliance-square hover-scale pointer" 
                                        :class="getComplianceColorClass(pod.compliance_data?.level)" 
                                        :title="pod.compliance_data?.level || 'Nessun livello'"
                                        @click.stop="openComplianceDetails(pod)">
                                    </div>
                                    
                                    <span class="c-code">{{ pod.pod_code }}</span>
                                    <span class="c-role" :class="pod.pod_role">{{ formatRole(pod.pod_role) }}</span>
                                    <div class="c-status" :class="pod.status">
                                        <span class="dot"></span> {{ pod.status === 'active' ? $t('pods.status.active') : $t('pods.status.pending') }}
                                    </div>
                                    
                                    <span v-if="pod.user" class="c-owner-name" style="margin-left: 10px; font-size: 0.85rem; color: var(--text-muted);">
                                        👤 {{ pod.user.name }} {{ pod.user.surname }}
                                    </span>
                                </div>
                                <svg class="chevron" :class="{ 'rotate': expandedPodId === pod.id }" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </div>

                            <transition name="accordion-slide">
                                <div v-show="expandedPodId === pod.id" class="accordion-body">
                                    
                                    <div class="c-body-top">
                                        <div class="action-buttons-row">
                                            <button 
                                                @click.prevent.stop="openQrModal(pod)" 
                                                class="btn-asset-nav hover-scale" 
                                                title="Mostra QR Code">
                                                📱 QR
                                            </button>

                                            <button 
                                                v-if="pod.ai_analysis" 
                                                @click.stop="openAiModal(pod.ai_analysis)" 
                                                class="btn-ai-indicator hover-scale" 
                                                :title="$t('pods.actions.viewAi')">
                                                ✨ {{ $t('pods.actions.aiBtn') }}
                                            </button>

                                            <button 
                                                @click.stop="openAssetModal(pod)" 
                                                class="btn-asset-nav hover-scale" 
                                                :title="$t('pods.actions.manageAssets')">
                                                <span class="icon">🔌</span> {{ $t('pods.actions.assetBtn') }}
                                            </button>
                                        </div>

                                        <div class="c-location">
                                            📍 {{ pod.city }} <span v-if="pod.province">({{ pod.province }})</span>, {{ pod.address }}
                                        </div>
                                    </div>

                                    <div class="c-tech-grid">
                                        <template v-if="pod.pod_role === 'consumer'">
                                            <div class="tech-cell"><span class="t-label">{{ $t('pods.labels.power') }}</span><span class="t-val">{{ pod.contract_power }} kW</span></div>
                                            <div class="tech-cell"><span class="t-label">{{ $t('pods.labels.consumption') }}</span><span class="t-val">{{ pod.annual_consumption_kwh }} kWh</span></div>
                                        </template>
                                        <template v-else-if="pod.pod_role === 'producer'">
                                            <div class="tech-cell"><span class="t-label">{{ $t('pods.labels.plant') }}</span><span class="t-val">{{ pod.production_capacity }} kWp</span></div>
                                            <div class="tech-cell"><span class="t-label">{{ $t('pods.labels.gse') }}</span><span class="t-val">{{ pod.gse_convention_code }}</span></div>
                                        </template>
                                        <template v-else-if="pod.pod_role === 'prosumer'">
                                            <div class="tech-cell"><span class="t-label">{{ $t('pods.labels.committed') }}</span><span class="t-val">{{ pod.contract_power }} kW</span></div>
                                            <div class="tech-cell"><span class="t-label">{{ $t('pods.labels.plant') }}</span><span class="t-val">{{ pod.production_capacity }} kWp</span></div>
                                            <div class="tech-cell"><span class="t-label">{{ $t('pods.labels.gse') }}</span><span class="t-val">{{ pod.gse_convention_code }}</span></div>
                                        </template>
                                        
                                        <div class="tech-cell" v-if="pod.has_storage">
                                            <span class="t-label">{{ $t('pods.labels.storage') }}</span><span class="t-val">{{ pod.storage_capacity }} kWh</span>
                                        </div>

                                        <div class="tech-cell" v-if="pod.bill_file">
                                            <span class="t-label">{{ $t('pods.labels.bill') }}</span>
                                            <a @click.prevent.stop="viewStorageFile(pod.bill_file, $t('pods.labels.bill'))" class="t-val doc-active hover-link" title="Visualizza Bolletta">
                                                📄 {{ $t('pods.labels.present') }}
                                            </a>
                                        </div>
                                        <div class="tech-cell" v-if="pod.load_curve_file">
                                            <span class="t-label">{{ $t('pods.labels.curves') }}</span>
                                            <a @click.prevent.stop="viewStorageFile(pod.load_curve_file, $t('pods.labels.curves'))" class="t-val doc-active hover-link" title="Visualizza Curve">
                                                📊 {{ $t('pods.labels.presents') }}
                                            </a>
                                        </div>
                                    </div>

                                    <div class="c-footer">
                                        <div class="c-left-actions">
                                            <span v-if="isActive(pod.status)" class="doc-links">
                                                <button @click.prevent.stop="viewPdf(pod, 'delegation')" class="c-link">{{ $t('pods.actions.delegation') }}</button>
                                                <span class="sep">|</span>
                                                <button @click.prevent.stop="viewPdf(pod, 'policy')" class="c-link">{{ $t('pods.actions.policy') }}</button>
                                            </span>
                                            <span v-else class="text-muted text-xs">
                                                Contratti non ancora firmati dall'utente.
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </transition>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <PodComplianceModal 
        :show="showComplianceModal" 
        :complianceData="selectedCompliance" 
        @close="closeComplianceModal" 
    />

    <PodAiModal 
        :show="showAiModal" 
        :aiData="selectedAiData" 
        @close="closeAiModal" 
    />

    <PodAssetModal
        :show="showAssetModal"
        :pod="selectedPodForAssets"
        @close="closeAssetModal"
    />
    
    <PodQrModal
        :show="showQrModal"
        :pod="selectedPodForQr"
        :qrUrl="generatedQrUrl"
        @close="closeQrModal"
    />

    <transition name="modal-fade">
        <div v-if="showPdfModal" class="modal-backdrop" @click.self="closePdfModal">
            <div class="glass-modal pdf-viewer-modal">
                <div class="modal-header">
                    <h3>{{ currentPdfTitle }}</h3>
                    <button @click="closePdfModal" class="btn-close-modal">✕</button>
                </div>
                <div class="modal-body-pdf">
                    <div v-if="pdfLoading" class="pdf-loading"><div class="spinner-small"></div></div>
                    <div v-else class="pdf-container-inner">
                        <div class="pdf-mobile-fallback">
                            <p>Non riesci a leggere il documento qui?</p>
                            <div class="pdf-actions">
                                <button @click="forceMobileDownload" class="btn-save-small">⬇️ Scarica PDF</button>
                            </div>
                        </div>
                        <iframe v-if="pdfUrl" :src="pdfUrl" class="pdf-iframe" title="PDF"></iframe>
                    </div>
                </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PodService from '@/services/PodService';
import apiClient from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';

// IMPORT MODALI ESTRATTE
import PodComplianceModal from '@/components/pods/PodComplianceModal.vue';
import PodAiModal from '@/components/pods/PodAiModal.vue';
import PodAssetModal from '@/components/pods/PodAssetModal.vue';
import PodQrModal from '@/components/pods/PodQrModal.vue';

const { t } = useI18n();

const isLightMode = ref(false);
const loading = ref(true);
const pods = ref([]);

const expandedPodId = ref(null); 

// STATI MODALI
const showPdfModal = ref(false);
const pdfLoading = ref(false);
const pdfUrl = ref('');
const currentPdfTitle = ref('');

const showAiModal = ref(false);
const selectedAiData = ref(null);

const showComplianceModal = ref(false);
const selectedCompliance = ref(null);

const showAssetModal = ref(false);
const selectedPodForAssets = ref(null);

const showQrModal = ref(false);
const selectedPodForQr = ref(null);
const generatedQrUrl = ref('');

onMounted(async () => {
    const savedTheme = localStorage.getItem('theme');
    isLightMode.value = savedTheme === 'light';
    if (isLightMode.value) document.body.classList.add('light-mode');

    await fetchPods();
});

const fetchPods = async () => {
    loading.value = true;
    try {
        const res = await PodService.getPods();
        pods.value = res.data;
    } catch (e) {
        console.error("Errore caricamento POD:", e);
    } finally {
        loading.value = false;
    }
};

const groupedPods = computed(() => {
    const groups = {};
    
    pods.value.forEach(pod => {
        const sub = pod.primary_substation && pod.primary_substation.trim() !== '' 
            ? pod.primary_substation.toUpperCase() 
            : 'unassigned';
            
        if (!groups[sub]) {
            groups[sub] = [];
        }
        groups[sub].push(pod);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === 'unassigned') return 1;
        if (b === 'unassigned') return -1;
        return a.localeCompare(b);
    });

    const sortedGroups = {};
    sortedKeys.forEach(key => {
        sortedGroups[key] = groups[key];
    });

    return sortedGroups;
});

// FUNZIONI ACCORDION & UTILS
const toggleAccordion = (id) => { expandedPodId.value = expandedPodId.value === id ? null : id; };

const formatRole = (r) => {
    if (r === 'consumer') return 'Consumer';
    if (r === 'producer') return 'Producer';
    if (r === 'prosumer') return 'Prosumer';
    return r;
};

const isActive = (status) => { return status && String(status).trim().toLowerCase() === 'active'; };

const getComplianceColorClass = (level) => {
    if (!level) return 'level-none';
    const l = level.toLowerCase();
    if (l.includes('bronze')) return 'level-bronze';
    if (l.includes('silver')) return 'level-silver';
    if (l.includes('gold')) return 'level-gold';
    if (l.includes('platinum')) return 'level-platinum';
    return 'level-none';
};

// GESTIONE MODALI
const openComplianceDetails = (pod) => {
    if (pod.compliance_data) {
        selectedCompliance.value = pod.compliance_data;
        showComplianceModal.value = true;
    }
};
const closeComplianceModal = () => { showComplianceModal.value = false; selectedCompliance.value = null; };

const openAiModal = (aiData) => {
    if (typeof aiData === 'string') {
        try { selectedAiData.value = JSON.parse(aiData); } 
        catch (e) { selectedAiData.value = null; return; }
    } else { selectedAiData.value = aiData; }
    showAiModal.value = true;
};
const closeAiModal = () => { showAiModal.value = false; selectedAiData.value = null; };

const openAssetModal = (pod) => {
    selectedPodForAssets.value = pod;
    showAssetModal.value = true;
};
const closeAssetModal = () => { 
    showAssetModal.value = false; 
    setTimeout(() => { selectedPodForAssets.value = null; }, 300);
};

const openQrModal = (pod) => {
    selectedPodForQr.value = pod;
    
    if (!pod.public_share_hash) {
        alert("Errore: Hash di condivisione non disponibile.");
        return;
    }
    
    generatedQrUrl.value = `http://192.168.0.206:5173/querypods?id=${pod.public_share_hash}`;
    showQrModal.value = true;
};
const closeQrModal = () => {
    showQrModal.value = false;
    setTimeout(() => { selectedPodForQr.value = null; generatedQrUrl.value = ''; }, 300);
};

// GESTIONE PDF E FILE
const getStorageUrl = (path) => {
    if (!path) return '#';
    const baseUrl = apiClient.defaults.baseURL.replace(/\/$/, '');
    return `${baseUrl}/storage/${path}`;
};

const viewStorageFile = (path, title) => {
    currentPdfTitle.value = title;
    pdfLoading.value = true;
    
    if(pdfUrl.value && pdfUrl.value.startsWith('blob:')) window.URL.revokeObjectURL(pdfUrl.value);
    
    pdfUrl.value = getStorageUrl(path);
    showPdfModal.value = true;
    setTimeout(() => { pdfLoading.value = false; }, 500);
};

const viewPdf = async (pod, type) => {
    if (pdfUrl.value && pdfUrl.value.startsWith('blob:')) {
        window.URL.revokeObjectURL(pdfUrl.value);
    }
    pdfUrl.value = '';
    
    showPdfModal.value = true; 
    pdfLoading.value = true;
    currentPdfTitle.value = type === 'delegation' ? t('pods.actions.delegation') : t('pods.actions.policy');
    
    try {
        const response = await PodService.downloadPodDoc(pod.id, type);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        pdfUrl.value = window.URL.createObjectURL(blob);
    } catch (e) { 
        showPdfModal.value = false; 
        alert(t('pods.alerts.errorLoadingPdf') || "Impossibile caricare il documento dal server."); 
    } finally { 
        pdfLoading.value = false; 
    }
};

const closePdfModal = () => { 
    showPdfModal.value = false; 
    if(pdfUrl.value && pdfUrl.value.startsWith('blob:')) window.URL.revokeObjectURL(pdfUrl.value); 
    pdfUrl.value = '';
};

const forceMobileDownload = async () => {
    try {
        const safeTitle = currentPdfTitle.value ? currentPdfTitle.value.replace(/[^a-zA-Z0-9]/g, '_') : 'Documento';
        const fileName = `${safeTitle}.pdf`;

        if (pdfUrl.value.startsWith('blob:')) {
            const link = document.createElement('a');
            link.href = pdfUrl.value;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            const response = await fetch(pdfUrl.value);
            if (!response.ok) throw new Error('Errore di rete');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        }
    } catch (e) {
        alert("Impossibile scaricare il file in questo momento.");
    }
};
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1.5rem 4rem 1.5rem; max-width: 1000px; margin: 0 auto; }
.pointer { cursor: pointer; }

.btn-ghost-small { background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; color: var(--text-muted); transition: 0.2s; }
.btn-ghost-small:hover { color: var(--text-main); border-color: var(--text-main); }

/* CARDS CABINE */
.substations-container { display: flex; flex-direction: column; gap: 2rem; }
.card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

.substation-header { 
    padding: 1.25rem 1.5rem; 
    border-bottom: 1px solid var(--border-color); 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    background: rgba(59, 130, 246, 0.05); 
}
.substation-title { display: flex; align-items: center; gap: 10px; }
.substation-title h3 { margin: 0; font-size: 1.2rem; color: var(--accent-blue); font-weight: 800; letter-spacing: 0.5px;}
.substation-title .icon { font-size: 1.5rem; }
.badge { background: var(--accent-blue); color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);}

/* STILE ACCORDION EREDITATO DA PODSVIEW */
.accordion-container { display: flex; flex-direction: column; gap: 12px; }
.accordion-item { background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; transition: all 0.2s ease; }
.accordion-item:hover { border-color: var(--accent-blue); }
.accordion-item.is-open { box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: var(--accent-blue); }
.accordion-header { padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; background: transparent; }
.header-main-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.compliance-square { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; box-shadow: inset 0 1px 3px rgba(0,0,0,0.2); }
.level-bronze { background: linear-gradient(135deg, #CD7F32, #8B4513); }
.level-silver { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); }
.level-gold { background: linear-gradient(135deg, #FFD700, #B8860B); }
.level-platinum { background: linear-gradient(135deg, #00f2fe, #4facfe); }
.level-none { background: var(--bg-card); border: 1px dashed var(--border-color); }

.c-code { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
.c-role { font-size: 0.65rem; background: var(--bg-card); padding: 2px 8px; border-radius: 4px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; border: 1px solid var(--border-color); }
.c-status { font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-color); }
.c-status.active { color: #16a34a; background: rgba(22, 163, 74, 0.1); border-color: rgba(22, 163, 74, 0.2); }
.c-status.pending { color: #d97706; background: rgba(217, 119, 6, 0.1); border-color: rgba(217, 119, 6, 0.2); }
.dot { width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
.chevron { color: var(--text-muted); transition: transform 0.3s ease; }
.chevron.rotate { transform: rotate(180deg); color: var(--accent-blue); }

.accordion-body { padding: 0 20px 20px 20px; border-top: 1px solid var(--border-color); margin-top: 10px; padding-top: 16px; }
.accordion-slide-enter-active, .accordion-slide-leave-active { transition: all 0.3s ease-in-out; max-height: 800px; opacity: 1; overflow: hidden; }
.accordion-slide-enter-from, .accordion-slide-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }

.action-buttons-row { display: flex; gap: 10px; margin-bottom: 16px; }
.btn-ai-indicator { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2); }
.btn-asset-nav { background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }

.c-location { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px; }
.c-tech-grid { display: flex; flex-wrap: wrap; gap: 15px; padding: 15px 0; border-top: 1px dashed var(--border-color); border-bottom: 1px dashed var(--border-color); margin-bottom: 1rem; }
.tech-cell { display: flex; flex-direction: column; }
.t-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
.t-val { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }
.doc-active { color: #16a34a; font-weight: 700; }
a.hover-link { text-decoration: none; cursor: pointer; transition: opacity 0.2s ease, text-decoration 0.2s ease; }
a.hover-link:hover { opacity: 0.7; text-decoration: underline; color: var(--accent-blue); }

.c-footer { display: flex; justify-content: space-between; align-items: center; }
.c-left-actions { display: flex; align-items: center; gap: 12px; }
.doc-links { display: flex; gap: 8px; align-items: center; }
.c-link { background: none; border: none; font-size: 0.85rem; font-weight: 500; color: var(--accent-cyan); cursor: pointer; padding: 0; }
.c-link:hover { text-decoration: underline; }
.sep { color: var(--border-color); font-size: 0.8rem; }
.text-xs { font-size: 0.75rem; }

/* COMMUNITY TAGS */
.c-community-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.comm-pill { display: flex; align-items: center; gap: 5px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: var(--accent-blue); padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; transition: all 0.2s ease; cursor: default; }
.cp-icon { font-size: 0.8rem; }
.cp-role-tag { font-size: 0.6rem; background: rgba(255,255,255,0.6); padding: 1px 4px; border-radius: 4px; margin-left: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

/* MODALI E PDF VIEWER */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; color: var(--text-main); }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }

.pdf-viewer-modal { max-width: 900px; height: 85vh; }
.modal-body-pdf { flex: 1; height: 100%; background: var(--bg-app); color: var(--text-main); }
.pdf-iframe { width: 100%; height: 100%; border: none; }
.pdf-loading { display: flex; align-items: center; justify-content: center; height: 100%; gap: 10px; color: var(--text-muted); }
.pdf-container-inner { display: flex; flex-direction: column; height: 100%; }
.pdf-mobile-fallback { display: none; padding: 12px; background: rgba(59, 130, 246, 0.08); text-align: center; border-bottom: 1px solid var(--border-color); }
.pdf-mobile-fallback p { margin: 0 0 10px 0; font-size: 0.85rem; color: var(--text-main); font-weight: 600; }
.pdf-actions { display: flex; gap: 10px; justify-content: center; }
.btn-save-small { background-color: var(--accent-blue); color: white; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 0.9rem; cursor: pointer; }

/* SPINNER E STATI */
.loading-state { text-align: center; padding: 4rem; color: var(--text-muted); }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px auto; }
.spinner-small { width: 24px; height: 24px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }

/* ANIMAZIONI */
.fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0;}
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }

@media (max-width: 768px) {
    .page-header-compact { flex-direction: column; align-items: stretch; gap: 15px; text-align: center;}
    .substation-header { flex-direction: column; gap: 10px; align-items: flex-start; }
    .pdf-mobile-fallback { display: block; }
    .pdf-iframe { flex: 1; height: calc(100% - 80px); }
}
</style>