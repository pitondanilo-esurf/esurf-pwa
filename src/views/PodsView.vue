<template>
  <div class="app-container">
    
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <div class="page-header-compact fade-in delay-1">
         <div class="header-left">
            <h2>{{ $t('pods.header.title') }}</h2>
            <p>{{ $t('pods.header.subtitle') }}</p>
         </div>
         <button class="btn-add-compact hover-scale" @click="openAddForm">
            {{ $t('pods.header.newBtn') }}
         </button>
      </div>

      <div class="content-area fade-in delay-2">
        <div v-if="loading" class="loading-state">
           <div class="spinner"></div><p>{{ $t('pods.status.loading') }}</p>
        </div>
        
        <div v-else class="pods-container">
            <div v-if="pods.length === 0" class="glass-card empty-state">
                <div class="empty-icon">⚡</div>
                <h3>{{ $t('pods.empty.title') }}</h3>
                <p>{{ $t('pods.empty.desc') }}</p>
                <button @click="openAddForm" class="btn-primary mt-3">{{ $t('pods.empty.addBtn') }}</button>
            </div>
            
            <div v-else class="accordion-container">
                <div v-for="pod in pods" :key="pod.id" class="accordion-item" :class="{ 'is-open': expandedPodId === pod.id }">
                    
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
                                    📍 {{ pod.city }} ({{ pod.province }}), {{ pod.address }}
                                </div>
                                
                                <div v-if="pod.communities && pod.communities.length > 0" class="c-community-row">
                                    <div v-for="comm in pod.communities" :key="comm.id" class="comm-pill" :title="comm.type">
                                        <span class="cp-icon">🤝</span> 
                                        <span class="cp-name">{{ comm.name }}</span>
                                        <span v-if="comm.pivot?.membership_type" class="cp-role-tag">
                                            {{ comm.pivot.membership_type === 'main_cer' ? 'Main' : 'Sub' }}
                                        </span>
                                    </div>
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
                                <div class="tech-cell" v-if="pod.primary_substation">
                                    <span class="t-label">{{ $t('pods.labels.substation') }}</span>
                                    <span class="t-val" style="color: var(--accent-blue);">{{ pod.primary_substation }}</span>
                                </div>                           
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
                                    <button @click.prevent.stop="openEditModal(pod)" class="c-btn-edit">✏️ {{ $t('pods.actions.edit') }}</button>
                                    
                                    <span v-if="isActive(pod.status)" class="doc-links">
                                        <span class="sep">|</span>
                                        <button @click.prevent.stop="viewPdf(pod, 'delegation')" class="c-link">{{ $t('pods.actions.delegation') }}</button>
                                        <button @click.prevent.stop="viewPdf(pod, 'policy')" class="c-link">{{ $t('pods.actions.policy') }}</button>
                                    </span>
                                </div>
                                
                                <div class="c-right-actions">
                                    <button v-if="isActive(pod.status)" @click.prevent.stop="revokeDelegation(pod)" class="c-rev-btn">{{ $t('pods.actions.revoke') }}</button>
                                    <div v-if="!isActive(pod.status)" style="display: flex; gap: 10px; align-items: center;">
                                        <button @click.prevent.stop="openDelegationModal(pod)" class="btn-primary sign-btn" style="padding: 6px 14px; font-size: 0.85rem;">{{ $t('pods.actions.sign') }}</button>
                                        <button @click.prevent.stop="removePod(pod.id)" class="c-btn-del" :title="$t('pods.actions.deleteAsset')">✕</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
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

    <PodSignModal 
        :show="showSignModal"
        :signingPod="signingPod"
        :currentDocType="currentDocType"
        :previewHtml="previewHtml"
        :signForm="signForm"
        :isSigning="isSigning"
        @close="closeSignModal"
        @switchTab="switchTab"
        @confirm="confirmSign"
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

    <transition name="modal-slide">
        <div v-if="showAddForm" class="modal-backdrop">
             <div class="glass-modal form-modal compact-modal">
                <div class="modal-header compact-header">
                    <h3>{{ isEditing ? $t('pods.formModal.editTitle') : $t('pods.formModal.newTitle') }}</h3>
                    <button @click="closeAddForm" class="btn-close-modal">✕</button>
                </div>
                
                <div class="modal-body compact-body">
                    
                    <div v-if="!isEditing && formMode === 'selection'" class="magic-selection fade-in">
                         <h4 class="text-center mb-3">{{ $t('pods.formModal.magicTitle') }}</h4>
                         <input type="file" id="magicBillInput" accept="application/pdf,image/*" style="display:none" @change="handleMagicUpload">
                         <div class="magic-card hover-scale" @click="triggerMagicUpload">
                             <div class="m-icon">📄✨</div>
                             <div class="m-text">
                                 <strong>{{ $t('pods.formModal.magicUploadBtn') }}</strong>
                                 <span>{{ $t('pods.formModal.magicUploadDesc') }}</span>
                             </div>
                         </div>
                         <div class="magic-divider"><span>{{ $t('pods.formModal.separator') }}</span></div>
                         <button class="btn-ghost-small full-width mt-2" style="padding: 12px; font-weight: 600;" @click="startManual">
                             ✍️ {{ $t('pods.formModal.manualBtn') }}
                         </button>
                    </div>

                    <div v-else-if="formMode === 'ai_loading' || uploadingFile" class="ai-processing-state">
                        <div class="ai-animation-box"><div class="magic-ring"><div class="magic-sparkle">✨</div></div></div>
                        <h3>{{ $t('pods.formModal.aiProgress') }}</h3>
                        <p>{{ $t('pods.formModal.aiReading') }}</p>
                        <p class="sub-text">{{ $t('pods.formModal.aiWait') }}</p>
                        <div class="loader-bar"><div class="bar-fill"></div></div>
                    </div>

                    <form v-else id="podForm" @submit.prevent class="compact-form fade-in">
                        <div class="role-selector-tiny">
                            <label class="role-opt" :class="{ active: form.pod_role === 'consumer' }"><input type="radio" v-model="form.pod_role" value="consumer"> Consumer</label>
                            <label class="role-opt" :class="{ active: form.pod_role === 'producer' }"><input type="radio" v-model="form.pod_role" value="producer"> Producer</label>
                            <label class="role-opt" :class="{ active: form.pod_role === 'prosumer' }"><input type="radio" v-model="form.pod_role" value="prosumer"> Prosumer</label>
                        </div>
                        <div class="form-grid-2">
                            <div class="form-group"><label>{{ $t('pods.formModal.fields.podCode') }}</label><input v-model="form.pod_code" maxlength="14" placeholder="IT..." required class="compact-input monospace" :disabled="isEditing"></div>
                            <div class="form-group"><label>{{ $t('pods.formModal.fields.address') }}</label><input v-model="form.address" placeholder="Via..." required class="compact-input"></div>
                        </div>
                        <div class="form-grid-3">
                            <div class="form-group"><label>{{ $t('pods.formModal.fields.city') }}</label><input v-model="form.city" required class="compact-input"></div>
                            <div class="form-group"><label>{{ $t('pods.formModal.fields.prov') }}</label><input v-model="form.province" maxlength="2" class="compact-input uppercase"></div>
                            <div class="form-group"><label>{{ $t('pods.formModal.fields.zip') }}</label><input v-model="form.zip_code" maxlength="5" class="compact-input"></div>
                        </div>
                        <div class="divider-micro"></div>
                        <div class="form-grid-2">
                            <template v-if="form.pod_role !== 'producer'">
                                <div class="form-group"><label>{{ $t('pods.formModal.fields.powerKw') }}</label><input v-model.number="form.contract_power" type="number" step="0.5" class="compact-input"></div>
                                <div class="form-group"><label>{{ $t('pods.formModal.fields.consumptionKwh') }}</label><input v-model.number="form.annual_consumption_kwh" type="number" class="compact-input"></div>
                            </template>
                            <template v-if="form.pod_role !== 'consumer'">
                                <div class="form-group"><label>{{ $t('pods.formModal.fields.plantKwp') }}</label><input v-model.number="form.production_capacity" type="number" step="0.1" class="compact-input"></div>
                                <div class="form-group"><label>{{ $t('pods.formModal.fields.gseCode') }}</label><input v-model="form.gse_convention_code" class="compact-input"></div>
                            </template>
                        </div>
                        <div v-if="form.pod_role !== 'consumer'" class="storage-row">
                            <label class="check-label"><input type="checkbox" v-model="form.has_storage"> {{ $t('pods.formModal.fields.hasStorage') }}</label>
                            <input v-if="form.has_storage" v-model.number="form.storage_capacity" type="number" placeholder="kWh" class="compact-input storage-input">
                        </div>
                        
                        <div class="upload-section">
                            <div class="section-title">{{ $t('pods.formModal.fields.documents') }}</div>
                            <div v-if="!isEditing" class="form-grid-2">
                                <div class="form-group"><label>{{ $t('pods.formModal.fields.billDoc') }}</label><input type="file" accept="application/pdf,image/*" @change="handleFileSelect('bill', $event)" class="file-input"><small v-if="billFile" style="color: #16a34a; font-size: 0.7rem; font-weight: 600; display: block; margin-top: 4px;">✔ {{ billFile.name }}</small></div>
                                <div class="form-group"><label>{{ $t('pods.formModal.fields.curveDoc') }}</label><input type="file" accept=".pdf,.xls,.xlsx,.csv" @change="handleFileSelect('curve', $event)" class="file-input"></div>
                            </div>
                            <div v-else class="edit-upload-grid">
                                <div class="upload-row">
                                    <div class="u-info"><label>{{ $t('pods.labels.bill') }}</label><span class="u-status" :class="{present: form.bill_file}">{{ form.bill_file ? '✔ ' + $t('pods.labels.present') : '❌ ' + $t('pods.formModal.missing') }}</span></div>
                                    <div class="u-actions"><input type="file" id="editBillInput" accept="application/pdf,image/*" class="file-input-compact" @change="handleFileSelect('bill', $event)"><button type="button" @click="uploadSingleFile('bill')" class="btn-upload-action" :disabled="!billFile || uploadingFile">{{ uploadingFile ? '...' : '⬆ ' + $t('pods.formModal.uploadAndAnalyze') }}</button></div>
                                </div>
                                <div class="divider-micro"></div>
                                <div class="upload-row">
                                    <div class="u-info"><label>{{ $t('pods.labels.curves') }}</label><span class="u-status" :class="{present: form.load_curve_file}">{{ form.load_curve_file ? '✔ ' + $t('pods.labels.presents') : '❌ ' + $t('pods.formModal.missings') }}</span></div>
                                    <div class="u-actions"><input type="file" id="editCurveInput" accept=".pdf,.xls,.xlsx,.csv" class="file-input-compact" @change="handleFileSelect('curve', $event)"><button type="button" @click="uploadSingleFile('curve')" class="btn-upload-action" :disabled="!curveFile || uploadingFile">{{ uploadingFile ? '...' : '⬆ ' + $t('pods.formModal.upload') }}</button></div>
                                </div>
                            </div>
                        </div>

                        <div v-if="!isEditing" class="legal-micro">
                            <label><input type="checkbox" v-model="form.accept_delegation" required> {{ $t('pods.actions.delegation') }}</label>
                            <label><input type="checkbox" v-model="form.accept_data_policy" required> {{ $t('pods.actions.policy') }}</label>
                        </div>
                        <div v-if="errorMsg" class="error-text">{{ errorMsg }}</div>
                    </form>
                </div>
                <div v-if="formMode === 'manual'" class="modal-footer compact-footer">
                    <button type="button" @click="closeAddForm" class="btn-ghost-small">{{ $t('pods.actions.cancel') }}</button>
                    <button type="button" @click="handleMainSubmit" class="btn-save-small" :disabled="submitting">{{ submitting ? $t('pods.status.waiting') : (isEditing ? $t('pods.formModal.updateData') : $t('pods.formModal.saveAsset')) }}</button>
                </div>
             </div>
        </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import apiClient from '@/services/axios'; 
import PodService from '@/services/PodService';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';

// IMPORT MODALI ESTRATTE
import PodComplianceModal from '@/components/pods/PodComplianceModal.vue';
import PodAiModal from '@/components/pods/PodAiModal.vue';
import PodSignModal from '@/components/pods/PodSignModal.vue';
import PodAssetModal from '@/components/pods/PodAssetModal.vue';
import PodQrModal from '@/components/pods/PodQrModal.vue';

const router = useRouter();
const { t } = useI18n();

const user = ref({});
const pods = ref([]);
const loading = ref(true);

const isLightMode = ref(false);
const expandedPodId = ref(null); 

const showAddForm = ref(false);
const formMode = ref('selection'); 
const showSignModal = ref(false);
const submitting = ref(false);
const isSigning = ref(false);
const errorMsg = ref('');

const isEditing = ref(false);
const editId = ref(null);
const billFile = ref(null);
const cachedAiAnalysis = ref(null); 
const curveFile = ref(null);
const uploadingFile = ref(false);

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

// --- STATI PER MODALE QR ---
const showQrModal = ref(false);
const selectedPodForQr = ref(null);
const generatedQrUrl = ref('');

const initialForm = { pod_code: '', pod_role: 'consumer', address: '', city: '', province: '', zip_code: '', contract_power: 3, annual_consumption_kwh: 2700, production_capacity: 0, gse_convention_code: '', has_storage: false, storage_capacity: 0, accept_delegation: true, accept_data_policy: true };
const form = ref({ ...initialForm });

const signingPod = ref(null);
const currentDocType = ref('delegation_pod_read');
const previewHtml = ref('');
const signForm = ref({ accept_delegation: false, accept_data_policy: false });

onMounted(async () => {
    const savedTheme = localStorage.getItem('theme');
    isLightMode.value = savedTheme === 'light';
    if (isLightMode.value) document.body.classList.add('light-mode');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    try {
        const userRes = await AuthService.getUser();
        user.value = userRes.data;
        await fetchPods();
    } catch (e) { if(e.response?.status === 401) router.push('/login'); }
});

const fetchPods = async () => {
  loading.value = true;
  try { const res = await PodService.getPods(); pods.value = res.data; } 
  catch (e) { console.error(e); } finally { loading.value = false; }
};

const toggleAccordion = (id) => { expandedPodId.value = expandedPodId.value === id ? null : id; };

const openComplianceDetails = (pod) => {
    if (pod.compliance_data) {
        selectedCompliance.value = pod.compliance_data;
        showComplianceModal.value = true;
    }
};
const closeComplianceModal = () => { showComplianceModal.value = false; selectedCompliance.value = null; };

const getComplianceColorClass = (level) => {
    if (!level) return 'level-none';
    const l = level.toLowerCase();
    if (l.includes('bronze')) return 'level-bronze';
    if (l.includes('silver')) return 'level-silver';
    if (l.includes('gold')) return 'level-gold';
    if (l.includes('platinum')) return 'level-platinum';
    return 'level-none';
};

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
        console.error("Errore PDF:", e);
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
        console.error("Download fallito:", e);
        alert("Impossibile scaricare il file in questo momento.");
    }
};

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
        alert("Errore: Hash di condivisione non disponibile. Aggiorna la pagina o contatta l'assistenza.");
        return;
    }
    
    generatedQrUrl.value = `http://192.168.0.206:5173/querypods?id=${pod.public_share_hash}`;
    showQrModal.value = true;
};

const closeQrModal = () => {
    showQrModal.value = false;
    setTimeout(() => { selectedPodForQr.value = null; generatedQrUrl.value = ''; }, 300);
};

const openAiModal = (aiData) => {
    if (typeof aiData === 'string') {
        try { selectedAiData.value = JSON.parse(aiData); } 
        catch (e) { selectedAiData.value = null; return; }
    } else { selectedAiData.value = aiData; }
    showAiModal.value = true;
};
const closeAiModal = () => { showAiModal.value = false; selectedAiData.value = null; };

const handleFileSelect = (type, event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (type === 'bill') { billFile.value = file; cachedAiAnalysis.value = null; } 
    else if (type === 'curve') { curveFile.value = file; }
};

const startManual = () => { formMode.value = 'manual'; };
const triggerMagicUpload = () => { document.getElementById('magicBillInput').click(); };

const handleMagicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    billFile.value = file; formMode.value = 'ai_loading'; errorMsg.value = '';
    try {
        const formData = new FormData(); formData.append('bill_file', file);
        if (PodService.extractFromBill) {
            const res = await PodService.extractFromBill(formData);
            const extracted = res.data.data; 
            if (extracted) {
                cachedAiAnalysis.value = JSON.stringify(extracted.raw_analysis);
                form.value.pod_code = extracted.pod_code || form.value.pod_code;
                form.value.address = extracted.address || form.value.address;
                form.value.city = extracted.city || form.value.city;
                form.value.province = extracted.province || form.value.province;
                form.value.zip_code = extracted.zip_code || form.value.zip_code;
                form.value.contract_power = extracted.contract_power || form.value.contract_power;
                form.value.annual_consumption_kwh = extracted.annual_consumption_kwh || form.value.annual_consumption_kwh;
            }
            alert(t('pods.alerts.extractionSuccess'));
        } else { alert(t('pods.alerts.extractionFailed')); }
    } catch (e) {
        let msg = t('pods.alerts.extractionFailed'); 
        if (e.response && e.response.status === 422 && e.response.data) {
            if (e.response.data.errors && e.response.data.errors.bill_file) msg = "⚠️ " + e.response.data.errors.bill_file[0];
            else if (e.response.data.message) msg = "⚠️ " + e.response.data.message;
        }
        alert(msg); 
    } finally { formMode.value = 'manual'; event.target.value = ''; }
};

const openAddForm = () => {
    isEditing.value = false; editId.value = null; form.value = { ...initialForm };
    billFile.value = null; curveFile.value = null; errorMsg.value = ''; cachedAiAnalysis.value = null; 
    formMode.value = 'selection'; showAddForm.value = true;
};

const openEditModal = (pod) => {
    isEditing.value = true; editId.value = pod.id; form.value = { ...pod };
    billFile.value = null; curveFile.value = null; errorMsg.value = ''; cachedAiAnalysis.value = null; 
    formMode.value = 'manual'; showAddForm.value = true;
};

const closeAddForm = () => { showAddForm.value = false; };
const handleMainSubmit = () => { if (isEditing.value) { updatePodDataOnly(); } else { createNewPodFull(); } };

const createNewPodFull = async () => {
    submitting.value = true; errorMsg.value = ''; const formData = new FormData();
    Object.keys(form.value).forEach(key => {
        const val = form.value[key];
        if (val !== null && val !== undefined && typeof val !== 'object') {
             if (typeof val === 'boolean') { formData.append(key, val ? 1 : 0); } else { formData.append(key, val); }
        }
    });
    if (billFile.value) formData.append('bill_file', billFile.value);
    if (curveFile.value) formData.append('load_curve_file', curveFile.value);
    if (cachedAiAnalysis.value) formData.append('ai_analysis_cache', cachedAiAnalysis.value);
    try { await PodService.addPod(formData); alert(t('pods.alerts.podCreated')); closeAddForm(); fetchPods(); } 
    catch (e) { handleError(e); } finally { submitting.value = false; }
};

const updatePodDataOnly = async () => {
    submitting.value = true; errorMsg.value = '';
    try {
        const dataToSend = { ...form.value }; delete dataToSend.bill_file; delete dataToSend.load_curve_file; 
        await PodService.updatePod(editId.value, dataToSend); alert(t('pods.alerts.podUpdated')); closeAddForm(); fetchPods();
    } catch (e) { handleError(e); } finally { submitting.value = false; }
};

const uploadSingleFile = async (type) => {
    uploadingFile.value = true; errorMsg.value = ''; const formData = new FormData(); formData.append('_method', 'PUT'); 
    Object.keys(form.value).forEach(key => {
        let val = form.value[key];
        if (['bill_file', 'load_curve_file'].includes(key)) return;
        if (val !== null && val !== undefined && typeof val !== 'object') {
             if (typeof val === 'boolean') { formData.append(key, val ? 1 : 0); } else { formData.append(key, val); }
        }
    });
    if (type === 'bill') { if (!billFile.value) return; formData.append('bill_file', billFile.value); } 
    else { if (!curveFile.value) return; formData.append('load_curve_file', curveFile.value); }
    try { await PodService.updatePod(editId.value, formData); alert(t('pods.alerts.fileAnalyzed')); await fetchPods(); } 
    catch (e) { handleError(e); } finally { uploadingFile.value = false; }
};

const handleError = (e) => {
    let displayMessage = t('pods.alerts.errorFallback');
    if (e.response) {
        if (e.response.status === 422 && e.response.data) {
            if (e.response.data.errors) displayMessage = `${t('pods.alerts.errorValidation')}: ${Object.values(e.response.data.errors)[0][0]}`;
            else if (e.response.data.message) displayMessage = `⚠️ ${e.response.data.message}`;
        } else { displayMessage = `Errore (${e.response.status}): ${e.response.data?.message || e.message}`; }
    }
    errorMsg.value = displayMessage; alert(displayMessage);
};

const removePod = async (id) => { if(confirm(t('pods.alerts.deletePodConfirm'))) { await PodService.deletePod(id); fetchPods(); }};
const revokeDelegation = async (pod) => { if(confirm(t('pods.alerts.revokeConfirm'))) { await PodService.revokePod(pod.id); fetchPods(); }};

const openDelegationModal = (pod) => { 
    signingPod.value = pod; signForm.value = { accept_delegation: false, accept_data_policy: false }; 
    showSignModal.value = true; switchTab('delegation_pod_read'); 
};
const closeSignModal = () => showSignModal.value = false;
const switchTab = async (type) => { currentDocType.value = type; try { const res = await PodService.getLegalPreview(type, signingPod.value.pod_code); previewHtml.value = res.data.html_content; } catch(e){} };

const confirmSign = async () => {
    isSigning.value = true;
    try { await PodService.signDelegation({ pod_id: signingPod.value.id, accept_delegation: true, accept_data_policy: true }); closeSignModal(); fetchPods(); }
    catch(e) { alert(t('pods.alerts.errorSigning')); } finally { isSigning.value = false; }
};

const formatRole = (r) => r === 'consumer' ? 'Consumer' : (r === 'producer' ? 'Producer' : 'Prosumer');
const isActive = (status) => { return status && String(status).trim().toLowerCase() === 'active'; };
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
/* TITOLI E BASE */
h2, .modal-header h3 { color: var(--text-main); transition: color 0.3s ease; }
h1 { color: var(--text-main); }
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1.5rem 4rem 1.5rem; max-width: 1000px; margin: 0 auto; }
.pointer { cursor: pointer; }

/* HEADER E BOTTONE */
.page-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 20px; }
.header-left h2 { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0; }
.header-left p { color: var(--text-muted); font-size: 14px; margin: 0; }

.btn-add-compact { background-color: var(--accent-blue); color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
.btn-add-compact:hover { background-color: var(--accent-cyan); }

/* HEADER ACCORDION */
.accordion-container { display: flex; flex-direction: column; gap: 12px; }
.accordion-item { background: var(--bg-card-alt); border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 12px; overflow: hidden; transition: all 0.2s ease; }
.accordion-item:hover { border-color: var(--accent-blue); }
.accordion-item.is-open { box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: var(--accent-blue); }
.accordion-header { padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; background: transparent; }
.header-main-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.compliance-square { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; box-shadow: inset 0 1px 3px rgba(0,0,0,0.2); }
.level-bronze { background: linear-gradient(135deg, #CD7F32, #8B4513); }
.level-silver { background: linear-gradient(135deg, #E0E0E0, #9E9E9E); }
.level-gold { background: linear-gradient(135deg, #FFD700, #B8860B); }
.level-platinum { background: linear-gradient(135deg, #00f2fe, #4facfe); }
.level-none { background: var(--bg-app); border: 1px dashed var(--border-color); }
.c-code { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
.c-role { font-size: 0.65rem; background: var(--bg-app); padding: 2px 8px; border-radius: 4px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; border: 1px solid var(--border-color); }
.c-status { font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 12px; background: var(--bg-app); border: 1px solid var(--border-color); }
.c-status.active { color: #16a34a; background: rgba(22, 163, 74, 0.1); border-color: rgba(22, 163, 74, 0.2); }
.c-status.pending { color: #d97706; background: rgba(217, 119, 6, 0.1); border-color: rgba(217, 119, 6, 0.2); }
.dot { width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
.chevron { color: var(--text-muted); transition: transform 0.3s ease; }
.chevron.rotate { transform: rotate(180deg); color: var(--accent-blue); }

/* CONTENUTO ACCORDION */
.accordion-body { padding: 0 20px 20px 20px; border-top: 1px solid var(--border-color); margin-top: 10px; padding-top: 16px; }
.accordion-slide-enter-active, .accordion-slide-leave-active { transition: all 0.3s ease-in-out; max-height: 800px; opacity: 1; overflow: hidden; }
.accordion-slide-enter-from, .accordion-slide-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }
.action-buttons-row { display: flex; gap: 10px; margin-bottom: 16px; }
.btn-ai-indicator { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; border: none; border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2); }
.btn-asset-nav { background: var(--bg-app); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 8px; padding: 6px 12px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.c-location { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px; }
.c-tech-grid { display: flex; flex-wrap: wrap; gap: 15px; padding: 15px 0; border-top: 1px dashed var(--border-color); border-bottom: 1px dashed var(--border-color); margin-bottom: 1rem; }
.tech-cell { display: flex; flex-direction: column; }
.t-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
.t-val { font-size: 0.95rem; font-weight: 600; color: var(--text-main); }
.doc-active { color: #16a34a; font-weight: 700; }
a.hover-link { text-decoration: none; cursor: pointer; transition: opacity 0.2s ease, text-decoration 0.2s ease; }
a.hover-link:hover { opacity: 0.7; text-decoration: underline; color: var(--accent-blue); }

.c-footer { display: flex; justify-content: space-between; align-items: center; }
.c-left-actions, .c-right-actions { display: flex; align-items: center; gap: 12px; }
.c-btn-edit { background: var(--bg-app); border: 1px solid var(--border-color); font-size: 0.85rem; font-weight: 600; color: var(--text-main); padding: 6px 12px; border-radius: 6px; cursor: pointer; }
.c-btn-edit:hover { border-color: var(--accent-blue); color: var(--accent-blue); }
.doc-links { display: flex; gap: 8px; align-items: center; }
.c-link { background: none; border: none; font-size: 0.85rem; font-weight: 500; color: var(--accent-cyan); cursor: pointer; padding: 0; }
.c-link:hover { text-decoration: underline; }
.sep { color: var(--border-color); font-size: 0.8rem; }
.c-rev-btn { background: none; border: none; font-size: 0.85rem; color: #ef4444; cursor: pointer; font-weight: 500; }
.sign-btn { padding: 6px 14px; font-size: 0.85rem; border-radius: 6px; background-color: var(--accent-blue); color: white; border: none; cursor: pointer; font-weight: 600; }
.c-btn-del { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 1rem; cursor: pointer; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.c-btn-del:hover { background: rgba(239, 68, 68, 0.2); }

/* MAGIC UPLOAD */
.magic-selection { display: flex; flex-direction: column; gap: 15px; padding: 10px 0; }
.magic-card { background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: all 0.3s ease; }
.magic-card:hover { background: linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%); border-color: var(--accent-blue); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
.m-icon { font-size: 2.5rem; }
.m-text { display: flex; flex-direction: column; }
.m-text strong { font-size: 1rem; color: var(--text-main); margin-bottom: 4px; }
.m-text span { font-size: 0.8rem; color: var(--text-muted); line-height: 1.3; }
.magic-divider { display: flex; align-items: center; text-align: center; margin: 10px 0; }
.magic-divider::before, .magic-divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--border-color); }
.magic-divider span { padding: 0 10px; color: var(--text-muted); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }

/* AI LOADING */
.ai-processing-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 2rem; animation: fadeIn 0.5s ease; color: var(--text-main); }
.ai-animation-box { margin-bottom: 1.5rem; position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
.magic-ring { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #e0e7ff, #eef2ff); box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); display: flex; align-items: center; justify-content: center; position: relative; animation: pulse-ring 2s infinite; }
.magic-ring::after { content: ''; position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #6366f1; border-top-color: transparent; animation: spin 1.5s linear infinite; }
.magic-sparkle { font-size: 2rem; animation: bounce 2s infinite; }
.ai-processing-state h3 { margin: 0 0 0.5rem 0; font-size: 1.2rem; }
.ai-processing-state p { color: var(--text-muted); font-size: 0.95rem; margin: 0; }
.ai-processing-state .sub-text { font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; }
.loader-bar { width: 100%; max-width: 250px; height: 6px; background: var(--bg-app); border-radius: 10px; margin-top: 1.5rem; overflow: hidden; position: relative; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); width: 50%; position: absolute; left: 0; top: 0; border-radius: 10px; animation: load-bar 2s ease-in-out infinite; }

/* MODALI IN GENERALE */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; color: var(--text-main); }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; color: var(--text-main); }
.modal-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-app); flex-shrink: 0; color: var(--text-main); }

/* MODALE FORM PRINCIPALE (COMPATTA) */
.compact-modal { max-width: 480px; }
.compact-header { padding: 0.8rem 1rem; background: var(--bg-app); border-bottom: 1px solid var(--border-color); }
.compact-header h3 { font-size: 1.1rem; margin: 0; color: var(--text-main); }
.compact-body { padding: 1rem; overflow-y: auto; max-height: 60vh; background: var(--bg-card); }
.compact-form { display: flex; flex-direction: column; gap: 8px; }
.role-selector-tiny { display: flex; background: var(--bg-app); padding: 3px; border-radius: 6px; margin-bottom: 10px; }
.role-opt { flex: 1; text-align: center; padding: 6px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: 5px; transition: 0.2s; }
.role-opt.active { background: var(--bg-card); color: var(--accent-blue); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.role-opt input { display: none; }
.form-group label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; font-weight: 600; }
.compact-input { width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); }
.compact-input:focus { border-color: var(--accent-blue); outline: none; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-grid-3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; }
.divider-micro { height: 1px; background: var(--border-color); margin: 8px 0; }
.storage-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: var(--bg-app); padding: 6px 10px; border-radius: 6px; }
.check-label { font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; color: var(--text-main); }
.storage-input { width: 80px; padding: 6px; font-size: 0.8rem; }
.legal-micro { display: flex; flex-direction: column; gap: 4px; font-size: 0.75rem; color: var(--text-muted); margin-top: 5px; }
.upload-section { background: var(--bg-app); padding: 10px; border-radius: 6px; margin-top: 5px; border: 1px dashed var(--border-color); }
.section-title { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; }
.file-input { font-size: 0.75rem; width: 100%; color: var(--text-main); }
.compact-footer { padding: 0.8rem 1rem; background: var(--bg-app); border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; }
.btn-save-small { background-color: var(--accent-blue); color: white; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.btn-ghost-small { background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; color: var(--text-muted); }

.edit-upload-grid { display: flex; flex-direction: column; gap: 10px; }
.upload-row { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; }
.u-info { display: flex; flex-direction: column; }
.u-status { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); }
.u-status.present { color: #16a34a; }
.u-actions { display: flex; align-items: center; gap: 8px; }
.file-input-compact { font-size: 0.75rem; max-width: 180px; color: var(--text-main); }
.btn-upload-action { background: var(--accent-blue); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-upload-action:disabled { background: var(--border-color); cursor: not-allowed; }

/* SPINNER & LOADING */
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.spinner-small { width: 24px; height: 24px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; }
.loading-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.empty-state { text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; border: 1px dashed var(--border-color); }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }

/* ANIMAZIONI */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
@keyframes load-bar { 0% { left: -50%; width: 50%; } 50% { left: 25%; width: 50%; } 100% { left: 100%; width: 50%; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

/* PDF VIEWER E FALLBACK MOBILE (Ripristinato in locale) */
.pdf-viewer-modal { max-width: 900px; height: 85vh; }
.modal-body-pdf { flex: 1; height: 100%; background: var(--bg-app); color: var(--text-main); }
.pdf-iframe { width: 100%; height: 100%; border: none; }
.pdf-loading { display: flex; align-items: center; justify-content: center; height: 100%; gap: 10px; color: var(--text-muted); }
.pdf-container-inner { display: flex; flex-direction: column; height: 100%; }
.pdf-mobile-fallback { display: none; padding: 12px; background: rgba(59, 130, 246, 0.08); text-align: center; border-bottom: 1px solid var(--border-color); }
.pdf-mobile-fallback p { margin: 0 0 10px 0; font-size: 0.85rem; color: var(--text-main); font-weight: 600; }
.pdf-actions { display: flex; gap: 10px; justify-content: center; }
.pdf-actions button { text-decoration: none; display: flex; align-items: center; gap: 5px; }

/* STILE BOTTONE QR */
.btn-qr-indicator { 
    background: var(--bg-app); 
    border: 1px solid var(--border-color); 
    color: var(--text-main); 
    border-radius: 8px; 
    padding: 6px 12px; 
    font-size: 0.8rem; 
    font-weight: 600; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 6px; 
}
.btn-qr-indicator:hover {
    border-color: var(--accent-blue);
    color: var(--accent-blue);
}

@media (max-width: 768px) {
    .main-content { padding: 1rem 1rem 2rem 1rem; }
    .page-header-compact { flex-direction: column; align-items: stretch; gap: 15px; }
    .header-left { text-align: center; }
    .btn-add-compact { width: 100%; padding: 12px; }
    .accordion-header { gap: 10px; padding: 8px 10px; }
    .header-main-info { gap: 6px; }
    .pdf-mobile-fallback { display: block; }
    .pdf-iframe { flex: 1; height: calc(100% - 80px); }
}

</style>