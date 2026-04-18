<template>
    <transition name="modal-fade">
        <div v-if="show" class="modal-backdrop" @click.self="closeModal">
            <div class="glass-modal asset-modal">
                <div class="modal-header">
                    <div class="header-title">
                        <h3>{{ $t('pods.assetModal.title') || 'Dispositivi & Asset' }}</h3>
                        <span class="subtitle-pod">{{ pod?.pod_code }}</span>
                    </div>
                    <button @click="closeModal" class="btn-close-modal">✕</button>
                </div>
  
                <div class="modal-body asset-body">
                    <div v-if="!isAddingAsset" class="asset-list-view">
                        <div v-if="loadingAssets" class="loading-state-small">
                            <div class="spinner-small"></div> {{ $t('pods.status.loading') || 'Caricamento...' }}
                        </div>
                        
                        <div v-else-if="!assetList || assetList.length === 0" class="empty-assets">
                            <span class="empty-icon-small">🔌</span>
                            <p>{{ $t('pods.assetModal.empty') || 'Nessun dispositivo configurato.' }}</p>
                            <button @click="startAddAsset" class="btn-primary-small mt-2">
                                + {{ $t('pods.assetModal.addBtn') || 'Aggiungi Dispositivo' }}
                            </button>
                        </div>
  
                        <div v-else class="assets-scroll-container">
                            <div v-for="asset in assetList" :key="asset.id" class="asset-row">
                                <div class="asset-icon-box">⚡</div>
                                <div class="asset-info">
                                    <div class="asset-name">{{ asset.name || formatAssetType(asset.asset_type) }}</div>
                                    <div class="asset-meta">
                                        <span class="badge-type">{{ formatAssetType(asset.asset_type) }}</span>
                                        <span>{{ asset.nominal_power || asset.capacity_kw || 0 }} kW</span>
                                    </div>
                                </div>
                                <div class="asset-actions" style="display: flex; gap: 5px;">
                                    <button @click="startEditAsset(asset)" class="btn-icon-action edit" :title="$t('pods.actions.edit') || 'Modifica'">✏️</button>
                                    <button @click="deleteAsset(asset.id)" class="btn-icon-action delete" :title="$t('pods.actions.deleteAsset') || 'Elimina'">🗑</button>
                                </div>
                            </div>
                            <button @click="startAddAsset" class="btn-dashed-add mt-3">
                                + {{ $t('pods.assetModal.addAnotherBtn') || 'Aggiungi un altro dispositivo' }}
                            </button>
                        </div>
                    </div>
  
                    <div v-else class="asset-form-view animate-up">
                        <h4 class="form-title">{{ isEditingAsset ? ($t('pods.assetModal.editTitle') || 'Modifica') : ($t('pods.assetModal.newTitle') || 'Nuovo Dispositivo') }}</h4>
                        
                        <form @submit.prevent="saveAsset" class="compact-form">
                            <div class="form-group">
                                <label>{{ $t('pods.assetModal.form.type') || 'Tipologia' }}</label>
                                <select v-model="assetForm.asset_type" class="compact-input" required>
                                    <option v-for="t in assetConfig.types" :key="t" :value="t">{{ formatAssetType(t) }}</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>{{ $t('pods.assetModal.form.name') || 'Nome (Opzionale)' }}</label>
                                <input v-model="assetForm.name" :placeholder="$t('pods.assetModal.form.namePlaceholder') || 'Es. Pompa di Calore Daikin'" class="compact-input">
                            </div>
  
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>{{ $t('pods.assetModal.form.power') || 'Potenza (kW)' }}</label>
                                    <input v-model.number="assetForm.nominal_power" type="number" step="0.1" class="compact-input" required>
                                </div>
                                <div class="form-group">
                                    <label>{{ $t('pods.assetModal.form.priority') || 'Priorità (0-5)' }}</label>
                                    <input v-model.number="assetForm.priority" type="number" min="0" max="5" class="compact-input" required>
                                </div>
                            </div>
  
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>{{ $t('pods.assetModal.form.usage') || 'Utilizzo' }}</label>
                                    <select v-model="assetForm.typical_usage" class="compact-input">
                                        <option v-for="u in assetConfig.usages" :key="u" :value="u">{{ formatUsage(u) }}</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>{{ $t('pods.assetModal.form.control') || 'Controllo' }}</label>
                                    <select v-model="assetForm.control" class="compact-input">
                                        <option v-for="c in assetConfig.controls" :key="c" :value="c">{{ formatControl(c) }}</option>
                                    </select>
                                </div>
                            </div>
  
                            <div class="form-actions mt-3">
                                <button type="button" @click="cancelAddAsset" class="btn-ghost-small">{{ $t('pods.actions.cancel') || 'Annulla' }}</button>
                                <button type="submit" class="btn-save-small" :disabled="submittingAsset">
                                    {{ submittingAsset ? ($t('pods.status.saving') || 'Salvataggio...') : (isEditingAsset ? ($t('pods.actions.update') || 'Aggiorna') : ($t('pods.actions.save') || 'Salva')) }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>
  
<script setup>
import { ref, reactive, watch, defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import PodService from '@/services/PodService';

const props = defineProps({
    show: Boolean,
    pod: Object
});

const emit = defineEmits(['close', 'saved']);
const { t } = useI18n();

const assetList = ref([]);
const loadingAssets = ref(false);
const isAddingAsset = ref(false);
const submittingAsset = ref(false);
const isEditingAsset = ref(false);
const editingAssetId = ref(null);

const assetConfig = reactive({ types: [], usages: [], controls: [] });
const assetForm = reactive({ name: '', asset_type: '', priority: 0, nominal_power: 0, typical_usage: 'always', control: 'Manuale' });

// VALORI ESATTI PRESI DAL TUO ENUM MYSQL
const fallbackConfig = {
    types: ['Heat Pump', 'EV', 'Washing Machine', 'Dishwasher', 'Dryer', 'AC', 'Boiler', 'Photovoltaic', 'Storage', 'Other', 'Inverter'],
    usages: ['always', 'summer', 'winter'], 
    controls: ['Remoto', 'Manuale', 'Non controllabile'] // ORA CORRETTO RISPETTO AL DB!
};

watch(() => props.show, async (isOpen) => {
    if (isOpen && props.pod) {
        isAddingAsset.value = false;
        loadingAssets.value = true;
        try {
            if (assetConfig.types.length === 0) {
                try {
                    const confRes = await PodService.getAssetTypes();
                    
                    let apiTypes = [];
                    if (Array.isArray(confRes.data)) apiTypes = confRes.data;
                    else if (confRes.data && Array.isArray(confRes.data.asset_types)) apiTypes = confRes.data.asset_types;
                    
                    assetConfig.types = [...new Set([...apiTypes, ...fallbackConfig.types])];
                    assetConfig.usages = fallbackConfig.usages;
                    assetConfig.controls = fallbackConfig.controls;
                } catch (apiError) {
                    assetConfig.types = fallbackConfig.types;
                    assetConfig.usages = fallbackConfig.usages;
                    assetConfig.controls = fallbackConfig.controls;
                }
            }
            
            const res = await PodService.getAssets(props.pod.id);
            assetList.value = res.data?.data || res.data || [];
        } catch (e) {
            console.warn("Errore caricamento lista asset.");
            assetList.value = []; 
        } finally {
            loadingAssets.value = false;
        }
    }
});

const closeModal = () => {
    emit('close');
    setTimeout(() => { isAddingAsset.value = false; }, 300);
};

const startAddAsset = () => {
    assetForm.name = ''; assetForm.priority = 0; assetForm.nominal_power = 0;
    assetForm.asset_type = assetConfig.types.includes('Photovoltaic') ? 'Photovoltaic' : assetConfig.types[0]; 
    assetForm.typical_usage = assetConfig.usages[0]; 
    assetForm.control = assetConfig.controls.includes('Manuale') ? 'Manuale' : assetConfig.controls[0];
    isEditingAsset.value = false; editingAssetId.value = null; isAddingAsset.value = true;
};

const startEditAsset = (asset) => {
    assetForm.name = asset.name || ''; 
    assetForm.priority = asset.priority || 0; 
    assetForm.nominal_power = asset.nominal_power || asset.capacity_kw || 0;
    
    const matchedType = assetConfig.types.find(t => t.toLowerCase() === String(asset.asset_type).toLowerCase());
    assetForm.asset_type = matchedType || assetConfig.types[0]; 
    
    assetForm.typical_usage = asset.typical_usage || assetConfig.usages[0]; 
    assetForm.control = asset.control || assetConfig.controls[0];
    isEditingAsset.value = true; editingAssetId.value = asset.id; isAddingAsset.value = true;
};

const cancelAddAsset = () => { isAddingAsset.value = false; isEditingAsset.value = false; editingAssetId.value = null; };

const saveAsset = async () => {
    submittingAsset.value = true;
    try {
        const payload = { 
            ...assetForm, 
            pod_id: props.pod.id
        };
        
        if (isEditingAsset.value) { 
            await PodService.updateAsset(editingAssetId.value, payload); 
        } else { 
            await PodService.createAsset(payload); 
        }
        
        const res = await PodService.getAssets(props.pod.id);
        assetList.value = res.data?.data || res.data || [];
        
        isAddingAsset.value = false; isEditingAsset.value = false; editingAssetId.value = null;
        emit('saved');
        
    } catch (e) {
        alert((t('pods.alerts.saveError') || "Errore") + ": " + (e.response?.data?.message || e.message));
    } finally { submittingAsset.value = false; }
};

const deleteAsset = async (id) => {
    if (!confirm(t('pods.alerts.deleteAssetConfirm') || "Sicuro di voler eliminare l'asset?")) return;
    try {
        await PodService.deleteAsset(id);
        assetList.value = assetList.value.filter(a => a.id !== id);
        emit('saved');
    } catch (e) { 
        alert(t('pods.alerts.deleteError') || "Errore eliminazione"); 
    }
};

// --- FORMATTAZIONE VISIVA UI & I18N ---
// Usa vue-i18n se la chiave esiste, altrimenti mostra l'italiano con emoji
const formatAssetType = (type) => {
    if (!type) return '';
    const map = {
        'Heat Pump': t('pods.assetModal.types.heatPump') || 'Pompa di Calore 🌡️',
        'EV': t('pods.assetModal.types.ev') || 'Wallbox / Auto Elettrica 🚗',
        'Washing Machine': t('pods.assetModal.types.washingMachine') || 'Lavatrice 👕',
        'Dishwasher': t('pods.assetModal.types.dishwasher') || 'Lavastoviglie 🍽️',
        'Dryer': t('pods.assetModal.types.dryer') || 'Asciugatrice 💨',
        'AC': t('pods.assetModal.types.ac') || 'Condizionatore ❄️',
        'Boiler': t('pods.assetModal.types.boiler') || 'Boiler / Scaldabagno 💧',
        'Photovoltaic': t('pods.assetModal.types.photovoltaic') || 'Fotovoltaico ☀️',
        'Storage': t('pods.assetModal.types.storage') || 'Accumulo / Batteria 🔋',
        'Inverter': t('pods.assetModal.types.inverter') || 'Inverter ⚡',
        'Other': t('pods.assetModal.types.other') || 'Altro Dispositivo ⚙️'
    };
    return map[type] || type;
};

const formatUsage = (usage) => {
    if (!usage) return '';
    const map = {
        'always': t('pods.assetModal.usages.always') || 'Sempre attivo (24h/7)',
        'summer': t('pods.assetModal.usages.summer') || 'Prevalentemente Estivo',
        'winter': t('pods.assetModal.usages.winter') || 'Prevalentemente Invernale'
    };
    return map[usage] || usage;
};

const formatControl = (control) => {
    if (!control) return '';
    const map = {
        'Manuale': t('pods.assetModal.controls.manual') || 'Manuale',
        'Remoto': t('pods.assetModal.controls.remote') || 'Remoto (IoT)',
        'Non controllabile': t('pods.assetModal.controls.uncontrollable') || 'Non controllabile'
    };
    return map[control] || control;
};
</script>
  
<style scoped>
/* BASE E MODALE */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; color: var(--text-main); }
.header-title { display: flex; flex-direction: column; }
.header-title h3 { margin: 0; font-size: 1.1rem; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }

/* ASSET STYLES */
.asset-modal { width: 100%; max-width: 450px; height: 500px; display: flex; flex-direction: column; }
.subtitle-pod { font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; font-family: monospace; margin-top: 2px;}
.asset-body { padding: 0; background: var(--bg-app); flex: 1; display: flex; flex-direction: column; overflow: hidden; color: var(--text-main); }

.asset-list-view { padding: 1rem; height: 100%; display: flex; flex-direction: column; }
.assets-scroll-container { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 5px;}
.asset-row { background: var(--bg-card); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 10px; }
.asset-icon-box { width: 32px; height: 32px; background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 1.1rem; }
.asset-info { flex: 1; }
.asset-name { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
.asset-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 6px; align-items: center; }
.badge-type { background: var(--bg-app); padding: 1px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; font-size: 0.65rem; color: var(--text-muted); }
.btn-icon-action { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.2s; font-size: 1rem; color: var(--text-main); }
.btn-icon-action.edit:hover { background-color: rgba(59, 130, 246, 0.1); }
.btn-icon-action.delete:hover { background-color: rgba(239, 68, 68, 0.1); }
.btn-dashed-add { border: 2px dashed var(--border-color); background: none; width: 100%; padding: 10px; border-radius: 8px; color: var(--text-muted); font-weight: 600; cursor: pointer; transition: 0.2s; margin-top: auto; }
.btn-dashed-add:hover { border-color: var(--accent-blue); color: var(--accent-blue); background: rgba(59, 130, 246, 0.05); }

.empty-assets { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
.empty-icon-small { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; }
.btn-primary-small { background-color: var(--accent-blue); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.9rem; margin-top: 15px; transition: 0.2s; }
.btn-primary-small:hover { background-color: var(--accent-cyan); }

/* FORM STYLES */
.asset-form-view { padding: 1.5rem; background: var(--bg-card); height: 100%; color: var(--text-main); }
.form-title { margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--text-main); }
.compact-form { display: flex; flex-direction: column; gap: 8px; }
.form-group label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; font-weight: 600; }
.compact-input { width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.85rem; background: var(--bg-card); color: var(--text-main); }
.compact-input:focus { border-color: var(--accent-blue); outline: none; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-save-small { background-color: var(--accent-blue); color: white; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.btn-save-small:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-ghost-small { background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; color: var(--text-muted); transition: 0.2s;}
.btn-ghost-small:hover { background: var(--bg-app); }

/* UTIL & ANIMATION */
.animate-up { animation: slideUp 0.3s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.spinner-small { width: 24px; height: 24px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state-small { padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; }
</style>