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
                                    <a @click.prevent="viewStorageFile(pod.bill_file, $t('pods.labels.bill'))" class="t-val doc-active hover-link" title="Visualizza Bolletta">
                                        📄 {{ $t('pods.labels.present') }}
                                    </a>
                                </div>
                                <div class="tech-cell" v-if="pod.load_curve_file">
                                    <span class="t-label">{{ $t('pods.labels.curves') }}</span>
                                    <a @click.prevent="viewStorageFile(pod.load_curve_file, $t('pods.labels.curves'))" class="t-val doc-active hover-link" title="Visualizza Curve">
                                        📊 {{ $t('pods.labels.presents') }}
                                    </a>
                                </div>
                            </div>

                            <div class="c-footer">
                                <div class="c-left-actions">
                                    <button @click="openEditModal(pod)" class="c-btn-edit">✏️ {{ $t('pods.actions.edit') }}</button>
                                    
                                    <span v-if="isActive(pod.status)" class="doc-links">
                                        <span class="sep">|</span>
                                        <button @click="viewPdf(pod, 'delegation')" class="c-link">{{ $t('pods.actions.delegation') }}</button>
                                        <button @click="viewPdf(pod, 'policy')" class="c-link">{{ $t('pods.actions.policy') }}</button>
                                    </span>
                                </div>
                                
                                <div class="c-right-actions">
                                    <button v-if="isActive(pod.status)" @click="revokeDelegation(pod)" class="c-rev-btn">{{ $t('pods.actions.revoke') }}</button>
                                    <div v-if="!isActive(pod.status)" style="display: flex; gap: 10px; align-items: center;">
                                        <button @click="openDelegationModal(pod)" class="btn-primary sign-btn" style="padding: 6px 14px; font-size: 0.85rem;">{{ $t('pods.actions.sign') }}</button>
                                        <button @click="removePod(pod.id)" class="c-btn-del" :title="$t('pods.actions.deleteAsset')">✕</button>
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

    <transition name="modal-fade">
        <div v-if="showComplianceModal" class="modal-backdrop" @click.self="closeComplianceModal">
            <div class="glass-modal compliance-modal">
                <div class="modal-header compliance-header">
                    <div class="header-title">
                        <h3>Maturità Asset</h3>
                        <span class="subtitle-pod">{{ selectedCompliance?.level }} &bull; {{ selectedCompliance?.score }}%</span>
                    </div>
                    <button @click="closeComplianceModal" class="btn-close-modal">✕</button>
                </div>
                
                <div class="modal-body compliance-body">
                    <div class="compliance-score-section">
                        <div class="score-ring" :class="getComplianceColorClass(selectedCompliance?.level)">
                            <span class="score-pct">{{ selectedCompliance?.score }}%</span>
                        </div>
                    </div>

                    <div class="compliance-breakdown">
                        <div class="breakdown-grid">
                            <div v-for="(status, key) in selectedCompliance?.breakdown" :key="key" class="breakdown-card">
                                <span class="b-label">{{ key.replace('_', ' ') }}</span>
                                <span class="b-status" :class="status.toLowerCase()">{{ status }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="selectedCompliance?.missing?.length" class="missing-actions-box">
                        <h4 class="box-title">🚀 Azioni Consigliate</h4>
                        <ul class="missing-list">
                            <li v-for="task in selectedCompliance.missing" :key="task">
                                <span class="list-bullet">⚡</span> {{ task }}
                            </li>
                        </ul>
                    </div>

                    <div class="compliance-footer-meta">
                        Calcolato il: {{ new Date(selectedCompliance?.last_calculated_at).toLocaleString() }}
                    </div>
                </div>
            </div>
        </div>
    </transition>

    <transition name="modal-fade">
        <div v-if="showAssetModal" class="modal-backdrop" @click.self="closeAssetModal">
            <div class="glass-modal asset-modal">
                <div class="modal-header">
                    <div class="header-title">
                        <h3>{{ $t('pods.assetModal.title') }}</h3>
                        <span class="subtitle-pod">{{ selectedPodForAssets?.pod_code }}</span>
                    </div>
                    <button @click="closeAssetModal" class="btn-close-modal">✕</button>
                </div>

                <div class="modal-body asset-body">
                    <div v-if="!isAddingAsset" class="asset-list-view">
                        <div v-if="loadingAssets" class="loading-state-small">
                            <div class="spinner-small"></div> {{ $t('pods.status.loading') }}
                        </div>
                        
                        <div v-else-if="!assetList || assetList.length === 0" class="empty-assets">
                            <span class="empty-icon-small">🔌</span>
                            <p>{{ $t('pods.assetModal.empty') }}</p>
                            <button @click="startAddAsset" class="btn-primary-small mt-2">
                                + {{ $t('pods.assetModal.addBtn') }}
                            </button>
                        </div>

                        <div v-else class="assets-scroll-container">
                            <div v-for="asset in assetList" :key="asset.id" class="asset-row">
                                <div class="asset-icon-box">⚡</div>
                                <div class="asset-info">
                                    <div class="asset-name">{{ asset.name }}</div>
                                    <div class="asset-meta">
                                        <span class="badge-type">{{ asset.asset_type }}</span>
                                        <span>{{ asset.nominal_power }} kW</span>
                                    </div>
                                </div>
                                <div class="asset-actions" style="display: flex; gap: 5px;">
                                    <button @click="startEditAsset(asset)" class="btn-icon-action edit" title="Modifica">✏️</button>
                                    <button @click="deleteAsset(asset.id)" class="btn-icon-action delete" title="Elimina">🗑</button>
                                </div>
                            </div>
                            <button @click="startAddAsset" class="btn-dashed-add mt-3">
                                + {{ $t('pods.assetModal.addAnotherBtn') }}
                            </button>
                        </div>
                    </div>

                    <div v-else class="asset-form-view animate-up">
                        <h4 class="form-title">{{ isEditingAsset ? $t('pods.assetModal.editTitle') : $t('pods.assetModal.newTitle') }}</h4>
                        
                        <form @submit.prevent="saveAsset" class="compact-form">
                            <div class="form-group">
                                <label>{{ $t('pods.assetModal.form.type') }}</label>
                                <select v-model="assetForm.asset_type" class="compact-input" required>
                                    <option v-for="t in assetConfig.types" :key="t" :value="t">{{ t }}</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>{{ $t('pods.assetModal.form.name') }}</label>
                                <input v-model="assetForm.name" placeholder="Es. Pompa Samsung" class="compact-input">
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>{{ $t('pods.assetModal.form.power') }}</label>
                                    <input v-model.number="assetForm.nominal_power" type="number" step="0.1" class="compact-input" required>
                                </div>
                                <div class="form-group">
                                    <label>{{ $t('pods.assetModal.form.priority') }}</label>
                                    <input v-model.number="assetForm.priority" type="number" min="0" max="5" class="compact-input" required>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>{{ $t('pods.assetModal.form.usage') }}</label>
                                    <select v-model="assetForm.typical_usage" class="compact-input">
                                        <option v-for="u in assetConfig.usages" :key="u" :value="u">{{ u }}</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>{{ $t('pods.assetModal.form.control') }}</label>
                                    <select v-model="assetForm.control" class="compact-input">
                                        <option v-for="c in assetConfig.controls" :key="c" :value="c">{{ c }}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-actions mt-3">
                                <button type="button" @click="cancelAddAsset" class="btn-ghost-small">{{ $t('pods.actions.cancel') }}</button>
                                <button type="submit" class="btn-save-small" :disabled="submittingAsset">
                                    {{ submittingAsset ? $t('pods.status.saving') : (isEditingAsset ? $t('pods.actions.update') : $t('pods.actions.save')) }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </transition>

    <transition name="modal-fade">
        <div v-if="showAiModal" class="modal-backdrop" @click.self="closeAiModal">
            <div class="glass-modal ai-modal">
                <div class="modal-header ai-header">
                    <div class="ai-title-box">
                        <h3>{{ $t('pods.aiModal.title') }}</h3>
                        <span class="ai-subtitle">Gemini Analysis &bull; {{ selectedAiData.pod_id || 'POD NON RILEVATO' }}</span>
                    </div>
                    <button @click="closeAiModal" class="btn-close-modal">✕</button>
                </div>
                
                <div class="modal-body ai-body">
                    <div v-if="selectedAiData" class="ai-content">
                        
                        <div class="ai-kpi-grid">
                            <div class="kpi-card" :class="getPotentialClass(selectedAiData.market_potential)">
                                <span class="kpi-label">MARKET</span>
                                <span class="kpi-value">{{ selectedAiData.market_potential || 'N/D' }}</span>
                            </div>
                            <div class="kpi-card" :class="getPotentialClass(selectedAiData.CER_potential)">
                                <span class="kpi-label">CER</span>
                                <span class="kpi-value">{{ selectedAiData.CER_potential || 'N/D' }}</span>
                            </div>
                            <div class="kpi-card" :class="getPotentialClass(selectedAiData['D&R_potential'])">
                                <span class="kpi-label">UVAM (D&R)</span>
                                <span class="kpi-value">{{ selectedAiData['D&R_potential'] || 'N/D' }}</span>
                            </div>
                            <div class="kpi-card confidence">
                                <span class="kpi-label">{{ $t('pods.aiModal.reliability') }}</span>
                                <span class="kpi-value">{{ selectedAiData.confidence ? (selectedAiData.confidence * 100).toFixed(0) : 0 }}%</span>
                            </div>
                        </div>

                        <div class="ai-section-box">
                            <div class="sec-head"><h4>👤 {{ $t('pods.aiModal.registry') }}</h4></div>
                            <div class="ai-grid-compact">
                                <div class="ai-item">
                                    <label>{{ $t('pods.aiModal.type') }}</label>
                                    <div class="ai-value">{{ selectedAiData.user_type === 'COMPANY' ? '🏢 ' + $t('pods.aiModal.company') : '🏠 ' + $t('pods.aiModal.private') }}</div>
                                </div>
                                <div class="ai-item" v-if="selectedAiData.PartitaIva">
                                    <label>P.IVA</label>
                                    <div class="ai-value">{{ selectedAiData.PartitaIva }}</div>
                                </div>
                                <div class="ai-item full-width" v-if="selectedAiData.indirizzo">
                                    <label>{{ $t('pods.aiModal.supplyAddress') }}</label>
                                    <div class="ai-value">
                                        {{ selectedAiData.indirizzo.Via }} {{ selectedAiData.indirizzo.NumeroCivico }}, 
                                        {{ selectedAiData.indirizzo.Cap }} {{ selectedAiData.indirizzo.Città }}
                                    </div>
                                </div>
                                <div class="ai-item full-width">
                                    <label>{{ $t('pods.aiModal.activeOffer') }}</label>
                                    <div class="ai-value text-cap">{{ selectedAiData.contract_type || 'N/D' }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="ai-grid-cols-2">
                            <div class="ai-section-box no-bg">
                                <div class="sec-head-tiny">{{ $t('pods.aiModal.techData') }}</div>
                                <div class="ai-list-rows">
                                    <div class="row-item">
                                        <span>{{ $t('pods.labels.power') }}</span>
                                        <strong>{{ selectedAiData.committed_power_kw }} kW</strong>
                                    </div>
                                    <div class="row-item">
                                        <span>{{ $t('pods.aiModal.voltage') }}</span>
                                        <strong>{{ selectedAiData.voltage_level || '-' }}</strong>
                                    </div>
                                    <div class="row-item">
                                        <span>{{ $t('pods.aiModal.meter') }}</span>
                                        <strong style="font-size: 0.8rem;">{{ selectedAiData.meter_type || '-' }}</strong>
                                    </div>
                                </div>
                            </div>

                            <div class="ai-section-box no-bg">
                                <div class="sec-head-tiny">{{ $t('pods.aiModal.materialCosts') }}</div>
                                <div class="ai-list-rows">
                                    <div class="row-item">
                                        <span>F1</span>
                                        <strong>{{ selectedAiData.costo_kwh?.F1 || '-' }} €</strong>
                                    </div>
                                    <div class="row-item">
                                        <span>F2</span>
                                        <strong>{{ selectedAiData.costo_kwh?.F2 || '-' }} €</strong>
                                    </div>
                                    <div class="row-item">
                                        <span>F3</span>
                                        <strong>{{ selectedAiData.costo_kwh?.F3 || '-' }} €</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="ai-section-box">
                            <div class="sec-head">
                                <h4>📊 {{ $t('pods.aiModal.consumptionAnalysis') }}</h4>
                                <span class="total-ann">{{ selectedAiData.consumption_bands?.total_annual }} kWh/anno</span>
                            </div>
                            
                            <div class="bands-display">
                                <div class="band-item f1">
                                    <span class="b-label">F1</span>
                                    <span class="b-val">{{ selectedAiData.consumption_bands?.f1 || 0 }}</span>
                                </div>
                                <div class="band-item f2">
                                    <span class="b-label">F2</span>
                                    <span class="b-val">{{ selectedAiData.consumption_bands?.f2 || 0 }}</span>
                                </div>
                                <div class="band-item f3">
                                    <span class="b-label">F3</span>
                                    <span class="b-val">{{ selectedAiData.consumption_bands?.f3 || 0 }}</span>
                                </div>
                            </div>

                            <div v-if="selectedAiData.quarter" class="quarters-row mt-2">
                                <div class="q-item" v-for="(val, key) in selectedAiData.quarter" :key="key">
                                    <span class="q-lbl">{{ key }}</span>
                                    <span class="q-val">{{ val }}</span>
                                </div>
                            </div>

                            <div v-if="selectedAiData.last_year" class="month-grid mt-3">
                                <div class="m-item" v-for="(val, key) in selectedAiData.last_year" :key="key">
                                    <span class="m-lbl">{{ key.substring(0,3) }}</span>
                                    <span class="m-val">{{ val }}</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="selectedAiData.market_notes" class="ai-notes-box">
                            <div class="notes-icon">💡</div>
                            <p>{{ selectedAiData.market_notes }}</p>
                        </div>
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

                         <div class="magic-divider"><span>oppure</span></div>

                         <button class="btn-ghost-small full-width mt-2" style="padding: 12px; font-weight: 600;" @click="startManual">
                             ✍️ {{ $t('pods.formModal.manualBtn') }}
                         </button>
                    </div>

                    <div v-else-if="formMode === 'ai_loading' || uploadingFile" class="ai-processing-state">
                        <div class="ai-animation-box">
                            <div class="magic-ring">
                                <div class="magic-sparkle">✨</div>
                            </div>
                        </div>
                        
                        <h3>{{ $t('pods.formModal.aiProgress') }}</h3>
                        <p>{{ $t('pods.formModal.aiReading') }}</p>
                        <p class="sub-text">{{ $t('pods.formModal.aiWait') }}</p>
                        
                        <div class="loader-bar">
                            <div class="bar-fill"></div>
                        </div>
                    </div>

                    <form v-else id="podForm" @submit.prevent class="compact-form fade-in">
                        <div class="role-selector-tiny">
                            <label class="role-opt" :class="{ active: form.pod_role === 'consumer' }">
                                <input type="radio" v-model="form.pod_role" value="consumer"> Consumer
                            </label>
                            <label class="role-opt" :class="{ active: form.pod_role === 'producer' }">
                                <input type="radio" v-model="form.pod_role" value="producer"> Producer
                            </label>
                            <label class="role-opt" :class="{ active: form.pod_role === 'prosumer' }">
                                <input type="radio" v-model="form.pod_role" value="prosumer"> Prosumer
                            </label>
                        </div>

                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>{{ $t('pods.formModal.fields.podCode') }}</label>
                                <input v-model="form.pod_code" maxlength="14" placeholder="IT..." required class="compact-input monospace" :disabled="isEditing">
                            </div>
                            <div class="form-group">
                                <label>{{ $t('pods.formModal.fields.address') }}</label>
                                <input v-model="form.address" placeholder="Via..." required class="compact-input">
                            </div>
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
                                <div class="form-group">
                                    <label>{{ $t('pods.formModal.fields.billDoc') }}</label>
                                    <input type="file" accept="application/pdf,image/*" @change="handleFileSelect('bill', $event)" class="file-input">
                                    <small v-if="billFile" style="color: #16a34a; font-size: 0.7rem; font-weight: 600; display: block; margin-top: 4px;">✔ {{ billFile.name }}</small>
                                </div>
                                <div class="form-group">
                                    <label>{{ $t('pods.formModal.fields.curveDoc') }}</label>
                                    <input type="file" accept=".pdf,.xls,.xlsx,.csv" @change="handleFileSelect('curve', $event)" class="file-input">
                                </div>
                            </div>

                            <div v-else class="edit-upload-grid">
                                <div class="upload-row">
                                    <div class="u-info">
                                        <label>{{ $t('pods.labels.bill') }}</label>
                                        <span class="u-status" :class="{present: form.bill_file}">
                                            {{ form.bill_file ? '✔ ' + $t('pods.labels.present') : '❌ ' + $t('pods.formModal.missing') }}
                                        </span>
                                    </div>
                                    <div class="u-actions">
                                        <input type="file" id="editBillInput" accept="application/pdf,image/*" class="file-input-compact" @change="handleFileSelect('bill', $event)">
                                        <button type="button" @click="uploadSingleFile('bill')" class="btn-upload-action" :disabled="!billFile || uploadingFile">
                                            {{ uploadingFile ? '...' : '⬆ ' + $t('pods.formModal.uploadAndAnalyze') }}
                                        </button>
                                    </div>
                                </div>

                                <div class="divider-micro"></div>

                                <div class="upload-row">
                                    <div class="u-info">
                                        <label>{{ $t('pods.labels.curves') }}</label>
                                        <span class="u-status" :class="{present: form.load_curve_file}">
                                            {{ form.load_curve_file ? '✔ ' + $t('pods.labels.presents') : '❌ ' + $t('pods.formModal.missings') }}
                                        </span>
                                    </div>
                                    <div class="u-actions">
                                        <input type="file" id="editCurveInput" accept=".pdf,.xls,.xlsx,.csv" class="file-input-compact" @change="handleFileSelect('curve', $event)">
                                        <button type="button" @click="uploadSingleFile('curve')" class="btn-upload-action" :disabled="!curveFile || uploadingFile">
                                            {{ uploadingFile ? '...' : '⬆ ' + $t('pods.formModal.upload') }}
                                        </button>
                                    </div>
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
                    <button type="button" @click="handleMainSubmit" class="btn-save-small" :disabled="submitting">
                        {{ submitting ? $t('pods.status.waiting') : (isEditing ? $t('pods.formModal.updateData') : $t('pods.formModal.saveAsset')) }}
                    </button>
                </div>
             </div>
        </div>
    </transition>

    <transition name="modal-fade">
        <div v-if="showSignModal" class="modal-backdrop">
            <div class="glass-modal sign-modal">
                <div class="modal-header"><h3>{{ $t('pods.signModal.title') }}</h3><button @click="closeSignModal" class="btn-close-modal">✕</button></div>
                <div class="modal-body">
                     <p class="modal-intro">{{ $t('pods.signModal.signFor') }} <b>{{ signingPod?.pod_code }}</b>.</p>
                     <div class="modal-tabs">
                        <button @click="switchTab('delegation_pod_read')" :class="{active: currentDocType==='delegation_pod_read'}">{{ $t('pods.actions.delegation') }}</button>
                        <button @click="switchTab('data_usage_policy')" :class="{active: currentDocType==='data_usage_policy'}">{{ $t('pods.actions.policy') }}</button>
                     </div>
                     <div class="doc-preview-container" v-html="previewHtml || $t('pods.status.loading')"></div>
                     <div class="checks-container mt-3">
                         <label><input type="checkbox" v-model="signForm.accept_delegation"> {{ $t('pods.signModal.acceptDel') }}</label>
                         <label><input type="checkbox" v-model="signForm.accept_data_policy"> {{ $t('pods.signModal.acceptPol') }}</label>
                     </div>
                </div>
                <div class="modal-footer"><button @click="confirmSign" class="btn-primary full-width" :disabled="isSigning || !signForm.accept_delegation || !signForm.accept_data_policy">{{ $t('pods.signModal.signBtn') }}</button></div>
            </div>
        </div>
    </transition>

    <transition name="modal-fade">
        <div v-if="showPdfModal" class="modal-backdrop" @click.self="closePdfModal">
            <div class="glass-modal pdf-viewer-modal">
                <div class="modal-header"><h3>{{ currentPdfTitle }}</h3><button @click="closePdfModal" class="btn-close-modal">✕</button></div>
                <div class="modal-body-pdf">
                    <div v-if="pdfLoading" class="pdf-loading"><div class="spinner-small"></div></div>
                    <iframe v-else :src="pdfUrl" class="pdf-iframe" title="PDF"></iframe>
                </div>
            </div>
        </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import apiClient from '@/services/axios'; 
import PodService from '@/services/PodService';
import AuthService from '@/services/AuthService';
import GuideHeader from '@/components/layout/GuideHeader.vue';

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

// Stato Compliance
const showComplianceModal = ref(false);
const selectedCompliance = ref(null);

const showAssetModal = ref(false);
const selectedPodForAssets = ref(null);
const assetList = ref([]);
const loadingAssets = ref(false);
const isAddingAsset = ref(false);
const submittingAsset = ref(false);
const isEditingAsset = ref(false);
const editingAssetId = ref(null);

const assetConfig = reactive({ types: [], usages: [], controls: [] });
const assetForm = reactive({ name: '', asset_type: '', priority: 0, nominal_power: 0, typical_usage: 'always', control: 'Manuale' });

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

// Apertura Compliance
const openComplianceDetails = (pod) => {
    if (pod.compliance_data) {
        selectedCompliance.value = pod.compliance_data;
        showComplianceModal.value = true;
    }
};
const closeComplianceModal = () => { showComplianceModal.value = false; selectedCompliance.value = null; };

// Associa la classe CSS colore in base al livello di compliance
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
    pdfUrl.value = getStorageUrl(path);
    showPdfModal.value = true;
    
    setTimeout(() => {
        pdfLoading.value = false;
    }, 500);
};

const openAssetModal = async (pod) => {
    selectedPodForAssets.value = pod;
    showAssetModal.value = true;
    isAddingAsset.value = false;
    loadingAssets.value = true;

    try {
        if (assetConfig.types.length === 0) {
            const confRes = await PodService.getAssetTypes();
            assetConfig.types = confRes.data.asset_types;
            assetConfig.usages = confRes.data.usages;
            assetConfig.controls = confRes.data.controls;
        }
        const res = await PodService.getAssets(pod.id);
        assetList.value = res.data;
    } catch (e) {
        alert(t('pods.alerts.assetLoadError'));
    } finally {
        loadingAssets.value = false;
    }
};

const closeAssetModal = () => { showAssetModal.value = false; selectedPodForAssets.value = null; };

const startAddAsset = () => {
    assetForm.name = ''; assetForm.priority = 0; assetForm.nominal_power = 0;
    assetForm.asset_type = assetConfig.types[0] || 'Other'; assetForm.typical_usage = 'always'; assetForm.control = 'Manuale';
    isEditingAsset.value = false; editingAssetId.value = null; isAddingAsset.value = true;
};

const startEditAsset = (asset) => {
    assetForm.name = asset.name; assetForm.priority = asset.priority; assetForm.nominal_power = asset.nominal_power;
    assetForm.asset_type = asset.asset_type; assetForm.typical_usage = asset.typical_usage; assetForm.control = asset.control;
    isEditingAsset.value = true; editingAssetId.value = asset.id; isAddingAsset.value = true;
};

const cancelAddAsset = () => { isAddingAsset.value = false; isEditingAsset.value = false; editingAssetId.value = null; };

const saveAsset = async () => {
    submittingAsset.value = true;
    try {
        const payload = { ...assetForm, pod_id: selectedPodForAssets.value.id };
        if (isEditingAsset.value) { await PodService.updateAsset(editingAssetId.value, payload); } 
        else { await PodService.createAsset(payload); }
        
        const res = await PodService.getAssets(selectedPodForAssets.value.id);
        assetList.value = res.data;
        isAddingAsset.value = false; isEditingAsset.value = false; editingAssetId.value = null;
    } catch (e) {
        alert(t('pods.alerts.saveError') + ": " + (e.response?.data?.message || e.message));
    } finally { submittingAsset.value = false; }
};

const deleteAsset = async (id) => {
    if (!confirm(t('pods.alerts.deleteAssetConfirm'))) return;
    try {
        await PodService.deleteAsset(id);
        assetList.value = assetList.value.filter(a => a.id !== id);
    } catch (e) { alert(t('pods.alerts.deleteError')); }
};

const openAiModal = (aiData) => {
    if (typeof aiData === 'string') {
        try { selectedAiData.value = JSON.parse(aiData); } 
        catch (e) { console.error("Errore parsing dati AI:", e); selectedAiData.value = null; return; }
    } else { selectedAiData.value = aiData; }
    showAiModal.value = true;
};

const closeAiModal = () => { showAiModal.value = false; selectedAiData.value = null; };
const getPotentialClass = (val) => {
    if (!val) return 'low';
    const v = val.toLowerCase();
    return v === 'high' ? 'high' : (v === 'medium' ? 'medium' : 'low');
};

const handleFileSelect = (type, event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (type === 'bill') { 
        billFile.value = file; 
        cachedAiAnalysis.value = null; 
    } else if (type === 'curve') { 
        curveFile.value = file; 
    }
};

const startManual = () => { formMode.value = 'manual'; };
const triggerMagicUpload = () => { document.getElementById('magicBillInput').click(); };

const handleMagicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    billFile.value = file; 
    formMode.value = 'ai_loading';
    errorMsg.value = '';

    try {
        const formData = new FormData();
        formData.append('bill_file', file);
        
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
        } else {
             console.warn("L'endpoint per l'estrazione non è configurato.");
             alert(t('pods.alerts.extractionFailed'));
        }
    } catch (e) {
        console.error("Estrazione automatica fallita", e.response?.data || e);
        
        let msg = t('pods.alerts.extractionFailed'); 
        
        if (e.response && e.response.status === 422) {
            const data = e.response.data;
            if (data.errors && data.errors.bill_file) {
                msg = "⚠️ Validazione Bolletta: " + data.errors.bill_file[0];
            } else if (data.message) {
                msg = "⚠️ Errore: " + data.message;
            }
        }
        
        alert(msg); 
    } finally {
        formMode.value = 'manual'; 
        event.target.value = ''; 
    }
};

const openAddForm = () => {
    isEditing.value = false; editId.value = null; form.value = { ...initialForm };
    billFile.value = null; curveFile.value = null; errorMsg.value = ''; 
    cachedAiAnalysis.value = null; 
    formMode.value = 'selection'; 
    showAddForm.value = true;
};

const openEditModal = (pod) => {
    isEditing.value = true; editId.value = pod.id; form.value = { ...pod };
    billFile.value = null; curveFile.value = null; errorMsg.value = ''; 
    cachedAiAnalysis.value = null; 
    formMode.value = 'manual'; 
    showAddForm.value = true;
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

    if (cachedAiAnalysis.value) {
        formData.append('ai_analysis_cache', cachedAiAnalysis.value);
    }

    try {
        await PodService.addPod(formData);
        alert(t('pods.alerts.podCreated'));
        closeAddForm(); fetchPods();
    } catch (e) { handleError(e); } finally { submitting.value = false; }
};

const updatePodDataOnly = async () => {
    submitting.value = true; errorMsg.value = '';
    try {
        const dataToSend = { ...form.value };
        delete dataToSend.bill_file; delete dataToSend.load_curve_file; 
        await PodService.updatePod(editId.value, dataToSend);
        alert(t('pods.alerts.podUpdated'));
        closeAddForm(); fetchPods();
    } catch (e) { handleError(e); } finally { submitting.value = false; }
};

const uploadSingleFile = async (type) => {
    uploadingFile.value = true; errorMsg.value = '';
    const formData = new FormData(); formData.append('_method', 'PUT'); 
    Object.keys(form.value).forEach(key => {
        let val = form.value[key];
        if (['bill_file', 'load_curve_file'].includes(key)) return;
        if (val !== null && val !== undefined && typeof val !== 'object') {
             if (typeof val === 'boolean') { formData.append(key, val ? 1 : 0); } else { formData.append(key, val); }
        }
    });

    if (type === 'bill') { if (!billFile.value) return; formData.append('bill_file', billFile.value); } 
    else { if (!curveFile.value) return; formData.append('load_curve_file', curveFile.value); }

    try {
        await PodService.updatePod(editId.value, formData);
        alert(t('pods.alerts.fileAnalyzed'));
        await fetchPods();
    } catch (e) { handleError(e); } finally { uploadingFile.value = false; }
};

const handleError = (e) => {
    let displayMessage = t('pods.alerts.errorFallback');
    if (e.response) {
        if (e.response.status === 422) {
            const data = e.response.data;
            if (data.errors) {
                const firstKey = Object.keys(data.errors)[0];
                const firstMsg = data.errors[firstKey][0];
                displayMessage = `${t('pods.alerts.errorValidation')}: ${firstMsg}`;
            } else if (data.message) {
                displayMessage = `⚠️ Attenzione: ${data.message}`;
            }
        } else {
            displayMessage = `${t('pods.alerts.errorServer')} (${e.response.status}): ${e.response.data.message || e.message}`;
        }
    } else { displayMessage = t('pods.alerts.errorNetwork'); }
    errorMsg.value = displayMessage; alert(displayMessage);
};

const viewPdf = async (pod, type) => {
    showPdfModal.value = true; pdfLoading.value = true;
    currentPdfTitle.value = type === 'delegation' ? t('pods.actions.delegation') : t('pods.actions.policy');
    try {
        const response = await PodService.downloadPodDoc(pod.id, type);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        pdfUrl.value = window.URL.createObjectURL(blob);
    } catch (e) { showPdfModal.value = false; alert(t('pods.alerts.errorLoadingPdf')); } 
    finally { pdfLoading.value = false; }
};

const closePdfModal = () => { 
    showPdfModal.value = false; 
    if(pdfUrl.value && pdfUrl.value.startsWith('blob:')) {
        window.URL.revokeObjectURL(pdfUrl.value); 
    }
    pdfUrl.value = '';
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

h2, .modal-header h3 {
    color: var(--text-main);
    transition: color 0.3s ease;
}

/* Se hai degli h1 specifici */
h1 {
    color: var(--text-main);
}

.pointer { cursor: pointer; }

/* SOVRASCRITTURE BASE PER CONTENITORE */
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1.5rem 4rem 1.5rem; max-width: 1000px; margin: 0 auto; }

.page-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 20px; }
.header-left h2 { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0; }
.header-left p { color: var(--text-muted); font-size: 14px; margin: 0; }

.btn-add-compact { 
    background-color: var(--accent-blue); 
    color: white; 
    border: none; 
    padding: 10px 24px; 
    border-radius: 8px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.2s ease; 
    display: inline-flex; 
    align-items: center; 
    justify-content: center; 
}
.btn-add-compact:hover { background-color: var(--accent-cyan); }

/* --- STILI ACCORDION --- */
.accordion-container { display: flex; flex-direction: column; gap: 12px; }
.accordion-item { background: var(--bg-card-alt); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; transition: all 0.2s ease; }
.accordion-item:hover { border-color: var(--accent-blue); }
.accordion-item.is-open { box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: var(--accent-blue); }
.accordion-header { padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: transparent; user-select: none; }

/* Header Row Flexbox: Mantiene ID, Type e Status sulla stessa riga */
.header-main-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Quadrato Livello Compliance */
.compliance-square {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    flex-shrink: 0;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
}
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

.accordion-body { padding: 0 20px 20px 20px; border-top: 1px solid var(--border-color); margin-top: 10px; padding-top: 16px; }
.accordion-slide-enter-active, .accordion-slide-leave-active { transition: all 0.3s ease-in-out; max-height: 800px; opacity: 1; overflow: hidden; }
.accordion-slide-enter-from, .accordion-slide-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }

/* --- CONTENUTO INTERNO ACCORDION --- */
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
a.hover-link:hover { opacity: 0.7; text-decoration: underline; }

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

/* --- STILI MAGIC UPLOAD --- */
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

/* --- STILI MODALI COMPLIANCE --- */
.compliance-modal { max-width: 500px; }
.compliance-header { background: var(--bg-app); border-bottom: 1px solid var(--border-color); padding: 1.2rem 1.5rem; color: var(--text-main); }
.compliance-body { padding: 1.5rem; background: var(--bg-card); display: flex; flex-direction: column; gap: 1.5rem; color: var(--text-main); }

.compliance-score-section { display: flex; justify-content: center; }
.score-ring {
    width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    border: 6px solid var(--border-color);
}
.score-ring.level-bronze { border-color: #CD7F32; }
.score-ring.level-silver { border-color: #E0E0E0; }
.score-ring.level-gold { border-color: #FFD700; }
.score-ring.level-platinum { border-color: #4facfe; }

.score-pct { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }

.breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.breakdown-card { background: var(--bg-app); border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; display: flex; flex-direction: column; }
.b-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
.b-status { font-size: 0.8rem; font-weight: 700; }
.b-status.ok, .b-status.excellent { color: #16a34a; }
.b-status.missing, .b-status.empty { color: #ef4444; }

.missing-actions-box { background: rgba(59, 130, 246, 0.05); border: 1px solid var(--border-color); border-radius: 10px; padding: 15px; }
.box-title { font-size: 0.9rem; margin: 0 0 10px 0; color: var(--text-main); }
.missing-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.missing-list li { font-size: 0.85rem; color: var(--text-main); display: flex; gap: 8px; align-items: center; }
.list-bullet { color: var(--accent-blue); font-size: 0.7rem; }

.compliance-footer-meta { font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 5px; }

/* MODALI E FORM COMPATTI */
.compact-modal { max-width: 480px; }
.compact-header { padding: 0.8rem 1rem; background: var(--bg-app); border-bottom: 1px solid var(--border-color); }
.compact-header h3 { font-size: 1.1rem; margin: 0; color: var(--text-main); }
.compact-body { padding: 1rem; overflow-y: auto; max-height: 60vh; background: var(--bg-card); color: var(--text-main); }
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

/* Common Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: var(--bg-card); width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; color: var(--text-main); }
.modal-header h3 { color: var(--text-main); }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; color: var(--text-main); }
.modal-footer { padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-app); flex-shrink: 0; color: var(--text-main); }
.pdf-viewer-modal { max-width: 900px; height: 85vh; }
.modal-body-pdf { flex: 1; height: 100%; background: var(--bg-app); color: var(--text-main); }
.pdf-iframe { width: 100%; height: 100%; border: none; }
.pdf-loading { display: flex; align-items: center; justify-content: center; height: 100%; gap: 10px; color: var(--text-muted); }

/* EDIT UPLOAD GRID */
.edit-upload-grid { display: flex; flex-direction: column; gap: 10px; }
.upload-row { display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; }
.u-info { display: flex; flex-direction: column; }
.u-status { font-size: 0.7rem; font-weight: 600; color: var(--text-muted); }
.u-status.present { color: #16a34a; }
.u-actions { display: flex; align-items: center; gap: 8px; }
.file-input-compact { font-size: 0.75rem; max-width: 180px; color: var(--text-main); }
.btn-upload-action { background: var(--accent-blue); color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-upload-action:disabled { background: var(--border-color); cursor: not-allowed; }

/* COMMUNITY TAGS */
.c-community-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.comm-pill { display: flex; align-items: center; gap: 5px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: var(--accent-blue); padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; transition: all 0.2s ease; cursor: default; }
.comm-pill:hover { background: rgba(59, 130, 246, 0.2); transform: translateY(-1px); }
.cp-icon { font-size: 0.8rem; }
.cp-role-tag { font-size: 0.6rem; background: rgba(255,255,255,0.6); padding: 1px 4px; border-radius: 4px; margin-left: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

/* ASSET MODAL */
.asset-modal { width: 100%; max-width: 450px; height: 500px; display: flex; flex-direction: column; }
.header-title { display: flex; flex-direction: column; }
.subtitle-pod { font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; font-family: monospace; }
.asset-body { padding: 0; background: var(--bg-app); flex: 1; display: flex; flex-direction: column; overflow: hidden; color: var(--text-main); }

.asset-list-view { padding: 1rem; height: 100%; display: flex; flex-direction: column; }
.assets-scroll-container { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
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

.loading-state-small { padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; }
.empty-assets { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
.empty-icon-small { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; }
.btn-primary-small { background-color: var(--accent-blue); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 0.9rem; margin-top: 15px; }

.asset-form-view { padding: 1.5rem; background: var(--bg-card); height: 100%; color: var(--text-main); }
.form-title { margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--text-main); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.animate-up { animation: slideUp 0.3s ease-out; }

/* AI PROCESSING STATE */
.ai-processing-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 2rem; animation: fadeIn 0.5s ease; color: var(--text-main); }
.ai-animation-box { margin-bottom: 1.5rem; position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
.magic-ring { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #e0e7ff, #eef2ff); box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); display: flex; align-items: center; justify-content: center; position: relative; animation: pulse-ring 2s infinite; }
.magic-ring::after { content: ''; position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #6366f1; border-top-color: transparent; animation: spin 1.5s linear infinite; }
.magic-sparkle { font-size: 2rem; animation: bounce 2s infinite; }
.ai-processing-state h3 { color: var(--text-main); margin: 0 0 0.5rem 0; font-size: 1.2rem; }
.ai-processing-state p { color: var(--text-muted); font-size: 0.95rem; margin: 0; }
.ai-processing-state .sub-text { font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; }
.loader-bar { width: 100%; max-width: 250px; height: 6px; background: var(--bg-app); border-radius: 10px; margin-top: 1.5rem; overflow: hidden; position: relative; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); width: 50%; position: absolute; left: 0; top: 0; border-radius: 10px; animation: load-bar 2s ease-in-out infinite; }

@keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
@keyframes load-bar { 0% { left: -50%; width: 50%; } 50% { left: 25%; width: 50%; } 100% { left: 100%; width: 50%; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.spinner-small { width: 24px; height: 24px; border: 3px solid var(--border-color); border-top: 3px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; }
.loading-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.empty-state { text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; border: 1px dashed var(--border-color); color: var(--text-main); }
.empty-state h3 { color: var(--text-main); }
.empty-state p { color: var(--text-muted); }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }

@media (max-width: 768px) {
    .main-content { padding: 1rem 1rem 2rem 1rem; }
    .page-header-compact { flex-direction: column; align-items: stretch; gap: 15px; }
    .header-left { text-align: center; }
    .btn-add-compact { width: 100%; padding: 12px; }
    
    .accordion-header { gap: 10px; padding: 8px 10px; }
    .header-main-info { gap: 6px; }
}

.checks-container label { color: var(--text-main); }

/* FIX DARK MODE TESTO LEGALE */
.doc-preview-container { color: var(--text-main); }
.doc-preview-container :deep(.details) { background-color: var(--bg-app) !important; color: var(--text-main) !important; border-color: var(--border-color) !important; }
.doc-preview-container :deep(*) { color: var(--text-main) !important; }

/* --- STILI MODALI VARI (AI MODAL COMPLETATA) --- */
.ai-modal { max-width: 600px; }
.ai-header { background: var(--bg-app); border-bottom: 1px solid var(--border-color); padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }
.ai-subtitle { font-size: 0.7rem; color: var(--accent-cyan); font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: block; margin-top: 2px; }
.ai-body { padding: 1.5rem; background: var(--bg-card); display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; color: var(--text-main); }
.ai-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 5px; }
.kpi-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; border-radius: 8px; text-align: center; border: 1px solid transparent; }
.kpi-label { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8; }
.kpi-value { font-size: 0.9rem; font-weight: 700; }
.kpi-card.high { background: rgba(22, 163, 74, 0.1); color: #15803d; border-color: rgba(22, 163, 74, 0.2); }
.kpi-card.medium { background: rgba(234, 179, 8, 0.1); color: #a16207; border-color: rgba(234, 179, 8, 0.2); }
.kpi-card.low { background: var(--bg-app); color: var(--text-muted); border-color: var(--border-color); }
.kpi-card.confidence { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; border-color: rgba(59, 130, 246, 0.2); }
.ai-section-box { background: var(--bg-app); border-radius: 10px; padding: 12px; border: 1px solid var(--border-color); }
.ai-section-box.no-bg { background: transparent; border: 1px solid var(--border-color); padding: 10px; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px; }
.sec-head h4 { margin: 0; font-size: 0.8rem; color: var(--text-main); text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
.sec-head-tiny { font-size: 0.65rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }
.total-ann { font-size: 0.75rem; font-weight: 700; color: var(--accent-cyan); background: rgba(59, 130, 246, 0.1); padding: 2px 8px; border-radius: 6px; }
.ai-grid-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
.ai-item label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 1px; }
.ai-value { font-size: 0.9rem; font-weight: 600; color: var(--text-main); line-height: 1.2; }
.ai-item.full-width { grid-column: span 2; }
.ai-grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ai-list-rows .row-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid var(--bg-app); }
.ai-list-rows span { color: var(--text-muted); }
.ai-list-rows strong { color: var(--text-main); }
.bands-display { display: flex; gap: 8px; margin-bottom: 12px; }
.band-item { flex: 1; text-align: center; background: var(--bg-card); padding: 6px 4px; border-radius: 6px; border: 1px solid var(--border-color); }
.b-label { display: block; font-size: 0.65rem; color: var(--text-muted); font-weight: 800; }
.b-val { font-size: 0.9rem; font-weight: 700; color: var(--text-main); }
.quarters-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.q-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 4px; text-align: center; }
.q-lbl { display: block; font-size: 0.6rem; color: var(--text-muted); font-weight: 700; }
.q-val { font-size: 0.8rem; font-weight: 600; color: var(--text-main); }
.month-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
.m-item { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 4px; padding: 3px; text-align: center; }
.m-lbl { display: block; font-size: 0.55rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
.m-val { font-size: 0.75rem; font-weight: 600; color: var(--text-main); }
.ai-notes-box { background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2); padding: 12px; border-radius: 8px; display: flex; gap: 10px; align-items: flex-start; margin-top: 5px; }
.notes-icon { font-size: 1.2rem; }
.ai-notes-box p { margin: 0; font-size: 0.85rem; color: var(--text-main); line-height: 1.4; }

</style>