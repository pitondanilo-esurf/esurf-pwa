<template>
  <div class="page-wrapper">
    
    <nav class="navbar glass-nav">
      <div class="nav-container">
        <div class="brand">
          <div class="logo-box">🌊</div>
          <span class="brand-text">e-Surf <span class="light">Energy</span></span>
        </div>
        <div class="desktop-menu">
             <router-link to="/dashboard" class="nav-link">Panoramica</router-link>
             <router-link :to="{ path: '/dashboard', query: { view: 'profile' } }" class="nav-link"> Profilo </router-link>
             <div class="nav-link active">I miei Contatori</div>
        </div>
        <div class="desktop-actions">
           <div class="user-pill">{{ (user.profile?.first_name || user.first_name || 'U')[0]?.toUpperCase() }}</div>
           <button @click="handleLogout" class="btn-logout-icon" title="Esci">🚪</button>
        </div>
        <button class="hamburger" @click="toggleMenu">
          <span class="bar" :class="{ open: isMenuOpen }"></span>
          <span class="bar" :class="{ open: isMenuOpen }"></span>
          <span class="bar" :class="{ open: isMenuOpen }"></span>
        </button>
      </div>
      <transition name="slide-down">
        <div v-if="isMenuOpen" class="mobile-menu glass-panel">
          <router-link to="/dashboard" class="mobile-link" @click="isMenuOpen=false">Panoramica</router-link>
          <router-link :to="{ path: '/dashboard', query: { view: 'profile' } }" class="mobile-link" @click="isMenuOpen=false">Profilo</router-link>
          <div class="mobile-link active" @click="isMenuOpen=false">I miei Contatori</div>
          <div class="divider"></div>
          <button @click="handleLogout" class="mobile-link logout">Esci</button>
        </div>
      </transition>
    </nav>

    <main class="main-content">
      <div class="page-header-compact">
         <div class="header-left">
            <h2>Portfolio Utenze</h2>
            <p>Gestione asset energetici</p>
         </div>
         <button class="btn-add-compact" @click="openAddForm">
            + Nuovo POD
         </button>
      </div>

      <div class="content-area">
        <div v-if="loading" class="loading-state">
           <div class="spinner"></div><p>Caricamento...</p>
        </div>
        <div v-else class="pods-container">
            <div v-if="pods.length === 0" class="glass-card empty-state">
                <div class="empty-icon">⚡</div>
                <h3>Nessun POD</h3>
                <p>Non hai ancora registrato nessun contatore.</p>
                <button @click="openAddForm" class="btn-primary mt-3">Aggiungi</button>
            </div>
            
            <div v-else class="pods-grid">
                <transition-group name="list">
                    <div v-for="pod in pods" :key="pod.id" class="compact-card">
                        
                        <div class="c-header">
                            <div class="c-identity">
                                <span class="c-code">{{ pod.pod_code }}</span>
                                <span class="c-role" :class="pod.pod_role">{{ formatRole(pod.pod_role) }}</span>
                            </div>
                            
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <button 
                                    v-if="pod.ai_analysis" 
                                    @click.stop="openAiModal(pod.ai_analysis)" 
                                    class="btn-ai-indicator" 
                                    title="Vedi Analisi">
                                    ✨
                                </button>

                                <button 
                                    @click.stop="openAssetModal(pod)" 
                                    class="btn-asset-nav" 
                                    title="Gestisci Dispositivi">
                                    <span class="icon">🔌</span>
                                </button>

                                <div class="c-status" :class="pod.status">
                                    <span class="dot"></span> {{ pod.status === 'active' ? 'Attivo' : 'In Attesa' }}
                                </div>
                            </div>
                        </div>

                        <div class="c-body-top">
                            <div class="c-location">
                                {{ pod.city }} ({{ pod.province }}), {{ pod.address }}
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
                                <div class="tech-cell"><span class="t-label">Potenza</span><span class="t-val">{{ pod.contract_power }} kW</span></div>
                                <div class="tech-cell"><span class="t-label">Consumo</span><span class="t-val">{{ pod.annual_consumption_kwh }} kWh</span></div>
                            </template>
                            <template v-else-if="pod.pod_role === 'producer'">
                                <div class="tech-cell"><span class="t-label">Impianto</span><span class="t-val">{{ pod.production_capacity }} kWp</span></div>
                                <div class="tech-cell"><span class="t-label">GSE</span><span class="t-val">{{ pod.gse_convention_code }}</span></div>
                            </template>
                            <template v-else-if="pod.pod_role === 'prosumer'">
                                <div class="tech-cell"><span class="t-label">Impegnata</span><span class="t-val">{{ pod.contract_power }} kW</span></div>
                                <div class="tech-cell"><span class="t-label">Impianto</span><span class="t-val">{{ pod.production_capacity }} kWp</span></div>
                                <div class="tech-cell"><span class="t-label">GSE</span><span class="t-val">{{ pod.gse_convention_code }}</span></div>
                            </template>
                            <div class="tech-cell" v-if="pod.primary_substation">
                                <span class="t-label">Cabina</span>
                                <span class="t-val" style="color: var(--accent);">{{ pod.primary_substation }}</span>
                            </div>                           
                            <div class="tech-cell" v-if="pod.has_storage">
                                <span class="t-label">Accumulo</span><span class="t-val">{{ pod.storage_capacity }} kWh</span>
                            </div>

                            <div class="tech-cell" v-if="pod.bill_file">
                                <span class="t-label">Bolletta</span>
                                <span class="t-val doc-active">✔ Presente</span>
                            </div>
                            <div class="tech-cell" v-if="pod.load_curve_file">
                                <span class="t-label">Curve</span>
                                <span class="t-val doc-active">✔ Presenti</span>
                            </div>
                        </div>

                        <div class="c-footer">
                            <div class="c-left-actions">
                                <button @click="openEditModal(pod)" class="c-btn-edit">✏️ Modifica</button>
                                
                                <span v-if="isActive(pod.status)" style="display: flex; gap: 5px; align-items: center;">
                                    <span class="sep">|</span>
                                    <button @click="viewPdf(pod, 'delegation')" class="c-link">Delega</button>
                                    <button @click="viewPdf(pod, 'policy')" class="c-link">Privacy</button>
                                </span>
                            </div>
                            
                            <div class="c-right-actions">
                                <button v-if="isActive(pod.status)" @click="revokeDelegation(pod)" class="c-rev-btn">Revoca</button>
                                <div v-if="!isActive(pod.status)" style="display: flex; gap: 10px; align-items: center;">
                                    <button @click="openDelegationModal(pod)" class="c-btn-sign" style="background-color: #0f172a; color: white; display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px;">Firma Documenti</button>
                                    <button @click="removePod(pod.id)" class="c-btn-del" title="Elimina Asset">✕</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </transition-group>
            </div>
        </div>
      </div>
    </main>

    <transition name="modal-fade">
        <div v-if="showAssetModal" class="modal-backdrop" @click.self="closeAssetModal">
            <div class="glass-modal asset-modal">
                <div class="modal-header">
                    <div class="header-title">
                        <h3>Dispositivi & Asset</h3>
                        <span class="subtitle-pod">{{ selectedPodForAssets?.pod_code }}</span>
                    </div>
                    <button @click="closeAssetModal" class="btn-close-modal">✕</button>
                </div>

                <div class="modal-body asset-body">
                    
                    <div v-if="!isAddingAsset" class="asset-list-view">
                        <div v-if="loadingAssets" class="loading-state-small">
                            <div class="spinner-small"></div> Caricamento...
                        </div>
                        
                        <div v-else-if="!assetList || assetList.length === 0" class="empty-assets">
                            <span class="empty-icon-small">🔌</span>
                            <p>Nessun dispositivo configurato.</p>
                            <button @click="startAddAsset" class="btn-primary-small mt-2">
                                + Aggiungi Dispositivo
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
                                    <button @click="startEditAsset(asset)" class="btn-icon-action edit" title="Modifica">
                                        ✏️
                                    </button>
                                    <button @click="deleteAsset(asset.id)" class="btn-icon-action delete" title="Elimina">
                                        🗑
                                    </button>
                                </div>
                            </div>
                            
                            <button @click="startAddAsset" class="btn-dashed-add mt-3">
                                + Aggiungi un altro dispositivo
                            </button>
                        </div>
                    </div>

                    <div v-else class="asset-form-view animate-up">
                        <h4 class="form-title">{{ isEditingAsset ? 'Modifica Dispositivo' : 'Nuovo Dispositivo' }}</h4>
                        
                        <form @submit.prevent="saveAsset" class="compact-form">
                            <div class="form-group">
                                <label>Tipo</label>
                                <select v-model="assetForm.asset_type" class="compact-input" required>
                                    <option v-for="t in assetConfig.types" :key="t" :value="t">{{ t }}</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Nome (Opzionale)</label>
                                <input v-model="assetForm.name" placeholder="Es. Pompa Samsung" class="compact-input">
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Potenza (kW)</label>
                                    <input v-model.number="assetForm.nominal_power" type="number" step="0.1" class="compact-input" required>
                                </div>
                                <div class="form-group">
                                    <label>Priorità (0-5)</label>
                                    <input v-model.number="assetForm.priority" type="number" min="0" max="5" class="compact-input" required>
                                </div>
                            </div>

                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label>Utilizzo</label>
                                    <select v-model="assetForm.typical_usage" class="compact-input">
                                        <option v-for="u in assetConfig.usages" :key="u" :value="u">{{ u }}</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Controllo</label>
                                    <select v-model="assetForm.control" class="compact-input">
                                        <option v-for="c in assetConfig.controls" :key="c" :value="c">{{ c }}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-actions mt-3">
                                <button type="button" @click="cancelAddAsset" class="btn-ghost-small">Annulla</button>
                                <button type="submit" class="btn-save-small" :disabled="submittingAsset">
                                    {{ submittingAsset ? 'Salvataggio...' : (isEditingAsset ? 'Aggiorna' : 'Salva') }}
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
                        <h3>✨ Analisi Energetica</h3>
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
                                <span class="kpi-label">AFFIDABILITÀ</span>
                                <span class="kpi-value">{{ selectedAiData.confidence ? (selectedAiData.confidence * 100).toFixed(0) : 0 }}%</span>
                            </div>
                        </div>

                        <div class="ai-section-box">
                            <div class="sec-head"><h4>👤 Anagrafica</h4></div>
                            <div class="ai-grid-compact">
                                <div class="ai-item">
                                    <label>Tipologia</label>
                                    <div class="ai-value">{{ selectedAiData.user_type === 'COMPANY' ? '🏢 Azienda' : '🏠 Privato' }}</div>
                                </div>
                                <div class="ai-item" v-if="selectedAiData.PartitaIva">
                                    <label>P.IVA</label>
                                    <div class="ai-value">{{ selectedAiData.PartitaIva }}</div>
                                </div>
                                <div class="ai-item full-width" v-if="selectedAiData.indirizzo">
                                    <label>Indirizzo Fornitura</label>
                                    <div class="ai-value">
                                        {{ selectedAiData.indirizzo.Via }} {{ selectedAiData.indirizzo.NumeroCivico }}, 
                                        {{ selectedAiData.indirizzo.Cap }} {{ selectedAiData.indirizzo.Città }}
                                    </div>
                                </div>
                                <div class="ai-item full-width">
                                    <label>Offerta Attiva</label>
                                    <div class="ai-value text-cap">{{ selectedAiData.contract_type || 'N/D' }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="ai-grid-cols-2">
                            <div class="ai-section-box no-bg">
                                <div class="sec-head-tiny">DATI TECNICI</div>
                                <div class="ai-list-rows">
                                    <div class="row-item">
                                        <span>Potenza</span>
                                        <strong>{{ selectedAiData.committed_power_kw }} kW</strong>
                                    </div>
                                    <div class="row-item">
                                        <span>Tensione</span>
                                        <strong>{{ selectedAiData.voltage_level || '-' }}</strong>
                                    </div>
                                    <div class="row-item">
                                        <span>Misuratore</span>
                                        <strong style="font-size: 0.8rem;">{{ selectedAiData.meter_type || '-' }}</strong>
                                    </div>
                                </div>
                            </div>

                            <div class="ai-section-box no-bg">
                                <div class="sec-head-tiny">COSTI MATERIA (€/kWh)</div>
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
                                <h4>📊 Analisi Consumi</h4>
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
                    <h3>{{ isEditing ? 'Modifica POD' : 'Nuovo POD' }}</h3>
                    <button @click="closeAddForm" class="btn-close-modal">✕</button>
                </div>
                
                <div class="modal-body compact-body">
                    
                    <div v-if="uploadingFile" class="ai-processing-state">
                        <div class="ai-animation-box">
                            <div class="magic-ring">
                                <div class="magic-sparkle">✨</div>
                            </div>
                        </div>
                        
                        <h3>Analisi AI in corso...</h3>
                        <p>E-surf sta leggendo i dati dalla tua bolletta.</p>
                        <p class="sub-text">L'operazione potrebbe richiedere alcuni secondi.</p>
                        
                        <div class="loader-bar">
                            <div class="bar-fill"></div>
                        </div>
                    </div>

                    <form v-else id="podForm" @submit.prevent class="compact-form">
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
                                <label>Codice POD</label>
                                <input v-model="form.pod_code" maxlength="14" placeholder="IT..." required class="compact-input monospace" :disabled="isEditing">
                            </div>
                            <div class="form-group">
                                <label>Indirizzo</label>
                                <input v-model="form.address" placeholder="Via..." required class="compact-input">
                            </div>
                        </div>

                        <div class="form-grid-3">
                            <div class="form-group"><label>Città</label><input v-model="form.city" required class="compact-input"></div>
                            <div class="form-group"><label>Pr.</label><input v-model="form.province" maxlength="2" class="compact-input uppercase"></div>
                            <div class="form-group"><label>CAP</label><input v-model="form.zip_code" maxlength="5" class="compact-input"></div>
                        </div>

                        <div class="divider-micro"></div>

                        <div class="form-grid-2">
                            <template v-if="form.pod_role !== 'producer'">
                                <div class="form-group"><label>Potenza (kW)</label><input v-model.number="form.contract_power" type="number" step="0.5" class="compact-input"></div>
                                <div class="form-group"><label>Consumo (kWh)</label><input v-model.number="form.annual_consumption_kwh" type="number" class="compact-input"></div>
                            </template>
                            <template v-if="form.pod_role !== 'consumer'">
                                <div class="form-group"><label>Imp. (kWp)</label><input v-model.number="form.production_capacity" type="number" step="0.1" class="compact-input"></div>
                                <div class="form-group"><label>Cod. GSE</label><input v-model="form.gse_convention_code" class="compact-input"></div>
                            </template>
                        </div>

                        <div v-if="form.pod_role !== 'consumer'" class="storage-row">
                            <label class="check-label"><input type="checkbox" v-model="form.has_storage"> Accumulo?</label>
                            <input v-if="form.has_storage" v-model.number="form.storage_capacity" type="number" placeholder="kWh" class="compact-input storage-input">
                        </div>

                        <div class="upload-section">
                            <div class="section-title">Documenti</div>
                            
                            <div v-if="!isEditing" class="form-grid-2">
                                <div class="form-group">
                                    <label>Bolletta (PDF/IMG)</label>
                                    <input type="file" accept="application/pdf,image/*" @change="handleFileSelect('bill', $event)" class="file-input">
                                </div>
                                <div class="form-group">
                                    <label>Curve (XLS/PDF)</label>
                                    <input type="file" accept=".pdf,.xls,.xlsx,.csv" @change="handleFileSelect('curve', $event)" class="file-input">
                                </div>
                            </div>

                            <div v-else class="edit-upload-grid">
                                <div class="upload-row">
                                    <div class="u-info">
                                        <label>Bolletta</label>
                                        <span class="u-status" :class="{present: form.bill_file}">
                                            {{ form.bill_file ? '✔ Presente' : '❌ Mancante' }}
                                        </span>
                                    </div>
                                    <div class="u-actions">
                                        <input type="file" id="editBillInput" accept="application/pdf,image/*" class="file-input-compact" @change="handleFileSelect('bill', $event)">
                                        <button type="button" @click="uploadSingleFile('bill')" class="btn-upload-action" :disabled="!billFile || uploadingFile">
                                            {{ uploadingFile ? '...' : '⬆ Carica & Analizza' }}
                                        </button>
                                    </div>
                                </div>

                                <div class="divider-micro"></div>

                                <div class="upload-row">
                                    <div class="u-info">
                                        <label>Curve di Carico</label>
                                        <span class="u-status" :class="{present: form.load_curve_file}">
                                            {{ form.load_curve_file ? '✔ Presenti' : '❌ Mancanti' }}
                                        </span>
                                    </div>
                                    <div class="u-actions">
                                        <input type="file" id="editCurveInput" accept=".pdf,.xls,.xlsx,.csv" class="file-input-compact" @change="handleFileSelect('curve', $event)">
                                        <button type="button" @click="uploadSingleFile('curve')" class="btn-upload-action" :disabled="!curveFile || uploadingFile">
                                            {{ uploadingFile ? '...' : '⬆ Carica' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="!isEditing" class="legal-micro">
                            <label><input type="checkbox" v-model="form.accept_delegation" required> Delega</label>
                            <label><input type="checkbox" v-model="form.accept_data_policy" required> Privacy</label>
                        </div>
                        
                        <div v-if="errorMsg" class="error-text">{{ errorMsg }}</div>
                    </form>
                </div>

                <div class="modal-footer compact-footer">
                    <button type="button" @click="closeAddForm" class="btn-ghost-small">Annulla</button>
                    <button type="button" @click="handleMainSubmit" class="btn-save-small" :disabled="submitting">
                        {{ submitting ? 'Attendere...' : (isEditing ? 'Aggiorna Dati' : 'Salva Asset') }}
                    </button>
                </div>
             </div>
        </div>
    </transition>

    <transition name="modal-fade">
        <div v-if="showSignModal" class="modal-backdrop">
            <div class="glass-modal sign-modal">
                <div class="modal-header"><h3>Attivazione</h3><button @click="closeSignModal" class="btn-close-modal">✕</button></div>
                <div class="modal-body">
                     <p class="modal-intro">Firma per <b>{{ signingPod?.pod_code }}</b>.</p>
                     <div class="modal-tabs">
                        <button @click="switchTab('delegation_pod_read')" :class="{active: currentDocType==='delegation_pod_read'}">Delega</button>
                        <button @click="switchTab('data_usage_policy')" :class="{active: currentDocType==='data_usage_policy'}">Privacy</button>
                     </div>
                     <div class="doc-preview-container" v-html="previewHtml || 'Caricamento...'"></div>
                     <div class="checks-container mt-3">
                         <label><input type="checkbox" v-model="signForm.accept_delegation"> Accetto Delega</label>
                         <label><input type="checkbox" v-model="signForm.accept_data_policy"> Accetto Privacy</label>
                     </div>
                </div>
                <div class="modal-footer"><button @click="confirmSign" class="btn-primary full-width" :disabled="isSigning || !signForm.accept_delegation || !signForm.accept_data_policy">FIRMA</button></div>
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
import PodService from '@/services/PodService';
import AuthService from '@/services/AuthService';

const router = useRouter();
const user = ref({});
const pods = ref([]);
const loading = ref(true);
const isMenuOpen = ref(false);

const showAddForm = ref(false);
const showSignModal = ref(false);
const submitting = ref(false);
const isSigning = ref(false);
const errorMsg = ref('');

const isEditing = ref(false);
const editId = ref(null);
const billFile = ref(null);
const curveFile = ref(null);
const uploadingFile = ref(false);

const showPdfModal = ref(false);
const pdfLoading = ref(false);
const pdfUrl = ref('');
const currentPdfTitle = ref('');

const showAiModal = ref(false);
const selectedAiData = ref(null);

// === VARIABILI PER GESTIONE ASSET (Nuove) ===
const showAssetModal = ref(false);
const selectedPodForAssets = ref(null);
const assetList = ref([]);
const loadingAssets = ref(false);
const isAddingAsset = ref(false);
const submittingAsset = ref(false);
const isEditingAsset = ref(false);
const editingAssetId = ref(null);

const assetConfig = reactive({
    types: [],
    usages: [],
    controls: []
});
const assetForm = reactive({
    name: '',
    asset_type: '',
    priority: 0,
    nominal_power: 0,
    typical_usage: 'always',
    control: 'Manuale'
});

const initialForm = { pod_code: '', pod_role: 'consumer', address: '', city: '', province: '', zip_code: '', contract_power: 3, annual_consumption_kwh: 2700, production_capacity: 0, gse_convention_code: '', has_storage: false, storage_capacity: 0, accept_delegation: true, accept_data_policy: true };
const form = ref({ ...initialForm });

const signingPod = ref(null);
const currentDocType = ref('delegation_pod_read');
const previewHtml = ref('');
const signForm = ref({ accept_delegation: false, accept_data_policy: false });

const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value;

onMounted(async () => {
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

// ===========================================
// FUNZIONI GESTIONE ASSET (Nuove)
// ===========================================
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
        alert("Errore caricamento asset");
    } finally {
        loadingAssets.value = false;
    }
};

const closeAssetModal = () => {
    showAssetModal.value = false;
    selectedPodForAssets.value = null;
};

const startAddAsset = () => {
    assetForm.name = '';
    assetForm.priority = 0;
    assetForm.nominal_power = 0;
    assetForm.asset_type = assetConfig.types[0] || 'Other';
    assetForm.typical_usage = 'always';
    assetForm.control = 'Manuale';
    
    isEditingAsset.value = false;
    editingAssetId.value = null;
    isAddingAsset.value = true;
};

const startEditAsset = (asset) => {
    assetForm.name = asset.name;
    assetForm.priority = asset.priority;
    assetForm.nominal_power = asset.nominal_power;
    assetForm.asset_type = asset.asset_type;
    assetForm.typical_usage = asset.typical_usage;
    assetForm.control = asset.control;

    isEditingAsset.value = true;
    editingAssetId.value = asset.id;
    isAddingAsset.value = true;
};

const cancelAddAsset = () => {
    isAddingAsset.value = false;
    isEditingAsset.value = false;
    editingAssetId.value = null;
};

const saveAsset = async () => {
    submittingAsset.value = true;
    try {
        const payload = { ...assetForm, pod_id: selectedPodForAssets.value.id };
        
        if (isEditingAsset.value) {
            await PodService.updateAsset(editingAssetId.value, payload);
        } else {
            await PodService.createAsset(payload);
        }
        
        const res = await PodService.getAssets(selectedPodForAssets.value.id);
        assetList.value = res.data;
        
        isAddingAsset.value = false;
        isEditingAsset.value = false;
        editingAssetId.value = null;

    } catch (e) {
        alert("Errore salvataggio: " + (e.response?.data?.message || e.message));
    } finally {
        submittingAsset.value = false;
    }
};

const deleteAsset = async (id) => {
    if (!confirm("Eliminare dispositivo?")) return;
    try {
        await PodService.deleteAsset(id);
        assetList.value = assetList.value.filter(a => a.id !== id);
    } catch (e) {
        alert("Errore eliminazione");
    }
};

// ===========================================

const openAiModal = (aiData) => {
    if (typeof aiData === 'string') {
        try {
            selectedAiData.value = JSON.parse(aiData);
        } catch (e) {
            console.error("Errore parsing dati AI:", e);
            selectedAiData.value = null;
            return;
        }
    } else {
        selectedAiData.value = aiData;
    }
    showAiModal.value = true;
};

const closeAiModal = () => {
    showAiModal.value = false;
    selectedAiData.value = null;
};

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
    } else if (type === 'curve') {
        curveFile.value = file;
    }
};

const openAddForm = () => {
    isEditing.value = false;
    editId.value = null;
    form.value = { ...initialForm };
    billFile.value = null; curveFile.value = null; errorMsg.value = '';
    showAddForm.value = true;
};

const openEditModal = (pod) => {
    isEditing.value = true;
    editId.value = pod.id;
    form.value = { ...pod };
    billFile.value = null; curveFile.value = null; errorMsg.value = '';
    showAddForm.value = true;
};

const closeAddForm = () => { showAddForm.value = false; };

const handleMainSubmit = () => {
    if (isEditing.value) {
        updatePodDataOnly(); 
    } else {
        createNewPodFull();  
    }
};

const createNewPodFull = async () => {
    submitting.value = true;
    errorMsg.value = '';
    const formData = new FormData();
    
    Object.keys(form.value).forEach(key => {
        const val = form.value[key];
        if (val !== null && val !== undefined && typeof val !== 'object') {
             if (typeof val === 'boolean') {
                 formData.append(key, val ? 1 : 0);
             } else {
                 formData.append(key, val);
             }
        }
    });

    if (billFile.value) formData.append('bill_file', billFile.value);
    if (curveFile.value) formData.append('load_curve_file', curveFile.value);

    try {
        await PodService.addPod(formData);
        alert("Nuovo POD creato con successo! Se hai caricato una bolletta, l'AI è al lavoro.");
        closeAddForm();
        fetchPods();
    } catch (e) {
        handleError(e);
    } finally {
        submitting.value = false;
    }
};

const updatePodDataOnly = async () => {
    submitting.value = true;
    errorMsg.value = '';
    try {
        const dataToSend = { ...form.value };
        delete dataToSend.bill_file; 
        delete dataToSend.load_curve_file; 
        
        await PodService.updatePod(editId.value, dataToSend);
        alert("Dati anagrafici aggiornati.");
        closeAddForm();
        fetchPods();
    } catch (e) {
        handleError(e);
    } finally {
        submitting.value = false;
    }
};

const uploadSingleFile = async (type) => {
    uploadingFile.value = true;
    errorMsg.value = '';
    
    const formData = new FormData();
    formData.append('_method', 'PUT'); 
    
Object.keys(form.value).forEach(key => {
        let val = form.value[key];

        // ❌ ERRORE PRECEDENTE:
        // if (['bill_file', 'load_curve_file', 'pod_code'].includes(key)) return;

        // ✅ CORREZIONE: Rimuovi 'pod_code' da questa lista.
        // Il backend richiede il pod_code per validare che sia unico (anche se è lo stesso).
        if (['bill_file', 'load_curve_file'].includes(key)) return;
        
        if (val !== null && val !== undefined && typeof val !== 'object') {
             if (typeof val === 'boolean') {
                 formData.append(key, val ? 1 : 0);
             } else {
                 formData.append(key, val);
             }
        }
    });

    if (type === 'bill') {
        if (!billFile.value) return;
        formData.append('bill_file', billFile.value);
    } else {
        if (!curveFile.value) return;
        formData.append('load_curve_file', curveFile.value);
    }

    try {
        const response = await PodService.updatePod(editId.value, formData);
        alert("File caricato e analizzato con successo!");
        await fetchPods();
    } catch (e) {
        handleError(e); 
    } finally {
        uploadingFile.value = false;
    }
};

const handleError = (e) => {
    console.error("API Error Details:", e);
    let displayMessage = "Si è verificato un errore imprevisto.";

    if (e.response) {
        if (e.response.status === 422) {
            const data = e.response.data;
            if (data.errors) {
                const firstKey = Object.keys(data.errors)[0];
                const firstMsg = data.errors[firstKey][0];
                displayMessage = `⚠️ Validazione non superata: ${firstMsg}`;
            } 
            else if (data.message) {
                displayMessage = `⚠️ Attenzione: ${data.message}`;
            }
        } 
        else {
            displayMessage = `Errore Server (${e.response.status}): ${e.response.data.message || e.message}`;
        }
    } else {
        displayMessage = "Errore di connessione. Verifica la tua rete.";
    }

    errorMsg.value = displayMessage;
    alert(displayMessage);
};

const viewPdf = async (pod, type) => {
    showPdfModal.value = true; pdfLoading.value = true;
    currentPdfTitle.value = type === 'delegation' ? 'Delega' : 'Privacy';
    try {
        const response = await PodService.downloadPodDoc(pod.id, type);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        pdfUrl.value = window.URL.createObjectURL(blob);
    } catch (e) { showPdfModal.value = false; alert("Errore caricamento."); } 
    finally { pdfLoading.value = false; }
};
const closePdfModal = () => { showPdfModal.value = false; if(pdfUrl.value) window.URL.revokeObjectURL(pdfUrl.value); };
const handleLogout = async () => { await AuthService.logout(); router.push('/'); };
const removePod = async (id) => { if(confirm("Eliminare asset?")) { await PodService.deletePod(id); fetchPods(); }};
const revokeDelegation = async (pod) => { if(confirm("Revocare delega?")) { await PodService.revokePod(pod.id); fetchPods(); }};

const openDelegationModal = (pod) => { 
    signingPod.value = pod; 
    signForm.value = { accept_delegation: false, accept_data_policy: false }; 
    showSignModal.value = true; 
    switchTab('delegation_pod_read'); 
};

const closeSignModal = () => showSignModal.value = false;
const switchTab = async (type) => { currentDocType.value = type; try { const res = await PodService.getLegalPreview(type, signingPod.value.pod_code); previewHtml.value = res.data.html_content; } catch(e){} };
const confirmSign = async () => {
    isSigning.value = true;
    try { await PodService.signDelegation({ pod_id: signingPod.value.id, accept_delegation: true, accept_data_policy: true }); closeSignModal(); fetchPods(); }
    catch(e) { alert("Errore firma"); } finally { isSigning.value = false; }
};
const formatRole = (r) => r === 'consumer' ? 'Consumer' : (r === 'producer' ? 'Producer' : 'Prosumer');
const isActive = (status) => {
    return status && String(status).trim().toLowerCase() === 'active';
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --primary: #0f172a; 
  --accent: #2563eb; 
  --bg-page: #f8fafc;
  --text-main: #334155;
  --text-muted: #64748b;
  --nav-height: 70px;
}

.page-wrapper { min-height: 100vh; background-color: var(--bg-page); font-family: 'Inter', sans-serif; padding-top: var(--nav-height); color: var(--text-main); }

/* NAVBAR (Standard) */
.navbar { position: fixed; top: 0; left: 0; width: 100%; height: var(--nav-height); z-index: 1000; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0,0,0,0.05); }
.nav-container { max-width: 1200px; margin: 0 auto; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; }
.brand { display: flex; align-items: center; gap: 10px; }
.logo-box { width: 35px; height: 35px; background: var(--accent); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.brand-text { font-weight: 700; font-size: 1.2rem; color: var(--primary); }
.brand-text .light { font-weight: 400; color: #64748b; }
.desktop-menu { display: flex; gap: 20px; }
.nav-link { text-decoration: none; color: var(--text-muted); font-weight: 500; padding: 6px 12px; border-radius: 6px; transition: 0.2s; }
.nav-link:hover, .nav-link.active { color: var(--accent); background: #eff6ff; }
.desktop-actions { display: flex; align-items: center; gap: 15px; }
.user-pill { width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem; color: var(--text-main); }
.btn-logout-icon { border: none; background: transparent; cursor: pointer; font-size: 1.2rem; opacity: 0.6; }
.hamburger { display: none; flex-direction: column; gap: 5px; border: none; background: none; cursor: pointer; padding: 5px; z-index: 1100; }
.bar { width: 24px; height: 3px; background: #334155; transition: 0.3s; border-radius: 2px; }
.bar.open:nth-child(1) { transform: rotate(45deg) translate(5px, 6px); }
.bar.open:nth-child(2) { opacity: 0; }
.bar.open:nth-child(3) { transform: rotate(-45deg) translate(5px, -6px); }
.mobile-menu { position: absolute; top: var(--nav-height); left: 0; width: 100%; background: white; padding: 1rem; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.mobile-link { text-decoration: none; color: #334155; padding: 12px; border-radius: 8px; font-weight: 500; text-align: center; background: #f8fafc; }
.mobile-link.warning { color: #ea580c; background: #fff7ed; }
.mobile-link.logout { color: #ef4444; background: #fef2f2; border: none; width: 100%; font-size: 1rem; cursor: pointer; }

/* HEADER & BTN ADD */
.main-content { padding: 4rem 1.5rem 2rem 1.5rem; max-width: 1000px; margin: 0 auto; }
.page-header-compact { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 20px; }
.header-left h2 { font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0; }
.header-left p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
.btn-add-compact { background-color: #555; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-size: 0.95rem; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.btn-add-compact:hover { background-color: #333; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15); }
.btn-add-compact:active { transform: translateY(0); }

/* CARD */
.pods-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
.compact-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease; display: flex; flex-direction: column; }
.compact-card:hover { border-color: #cbd5e1; box-shadow: 0 8px 12px -3px rgba(0, 0, 0, 0.05); transform: translateY(-2px); }

/* Card Internals */
.c-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem; }
.c-identity { display: flex; flex-direction: column; gap: 4px; }
.c-code { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--primary); }
.c-role { font-size: 0.65rem; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; width: fit-content; }
.c-status { font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 12px; background: #f8fafc; height: fit-content; }
.c-status.active { color: #16a34a; background: #dcfce7; } .c-status.pending { color: #d97706; background: #fff7ed; }
.dot { width: 6px; height: 6px; background: currentColor; border-radius: 50%; }

/* BOTTONE "AI" */
.btn-ai-indicator {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    color: white; border: none; border-radius: 12px;
    padding: 2px 8px; font-size: 0.7rem; font-weight: 700;
    cursor: default; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.c-body-top { margin-bottom: 1rem; }
.c-location { font-size: 0.85rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.c-tech-grid { display: flex; flex-wrap: wrap; gap: 15px; padding: 10px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; margin-bottom: 1rem; }
.tech-cell { display: flex; flex-direction: column; }
.t-label { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
.t-val { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }
.doc-active { color: #16a34a; font-weight: 700; }

.c-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
.c-left-actions, .c-right-actions { display: flex; align-items: center; gap: 8px; }
.c-btn-edit { background: #f1f5f9; border: none; font-size: 0.8rem; font-weight: 600; color: var(--primary); padding: 4px 10px; border-radius: 4px; cursor: pointer; }
.c-btn-edit:hover { background: #e2e8f0; }
.c-link { background: none; border: none; font-size: 0.8rem; font-weight: 500; color: var(--accent); cursor: pointer; padding: 0; }
.c-link:hover { text-decoration: underline; }
.sep { color: #cbd5e1; font-size: 0.8rem; }
.c-rev-btn { background: none; border: none; font-size: 0.85rem; color: #ef4444; cursor: pointer; opacity: 0.8; font-weight: 500; }
.c-btn-sign { background: var(--primary); color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; cursor: pointer; font-weight: 600; }
.c-btn-del { background: #fef2f2; border: none; color: #ef4444; font-size: 1rem; cursor: pointer; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }

/* AI MODAL STYLES */
.ai-modal { max-width: 600px; }
.ai-header { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
.ai-subtitle { font-size: 0.7rem; color: var(--accent); font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; display: block; margin-top: 2px; }
.ai-body { padding: 1.5rem; background: #fff; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; }

/* KPI GRID */
.ai-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 5px; }
.kpi-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; border-radius: 8px; text-align: center; border: 1px solid transparent; }
.kpi-label { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8; }
.kpi-value { font-size: 0.9rem; font-weight: 700; }

.kpi-card.high { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.kpi-card.medium { background: #fef9c3; color: #a16207; border-color: #fde047; }
.kpi-card.low { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }
.kpi-card.confidence { background: #eff6ff; color: #1e40af; border-color: #dbeafe; }

/* SEZIONI E GRIGLIE AI */
.ai-section-box { background: #f8fafc; border-radius: 10px; padding: 12px; border: 1px solid #e2e8f0; }
.ai-section-box.no-bg { background: transparent; border: 1px solid #e2e8f0; padding: 10px; }

.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; }
.sec-head h4 { margin: 0; font-size: 0.8rem; color: #475569; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
.sec-head-tiny { font-size: 0.65rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px; }

.total-ann { font-size: 0.75rem; font-weight: 700; color: var(--accent); background: #eff6ff; padding: 2px 8px; border-radius: 6px; }

.ai-grid-compact { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
.ai-item label { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 1px; }
.ai-value { font-size: 0.9rem; font-weight: 600; color: #334155; line-height: 1.2; }
.ai-item.full-width { grid-column: span 2; }
.text-cap { text-transform: capitalize; }

.ai-grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.ai-list-rows .row-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
.ai-list-rows .row-item:last-child { border-bottom: none; }
.ai-list-rows span { color: #64748b; }
.ai-list-rows strong { color: #334155; }

/* CONSUMI */
.bands-display { display: flex; gap: 8px; margin-bottom: 12px; }
.band-item { flex: 1; text-align: center; background: white; padding: 6px 4px; border-radius: 6px; border: 1px solid #e2e8f0; }
.b-label { display: block; font-size: 0.65rem; color: #64748b; font-weight: 800; }
.b-val { font-size: 0.9rem; font-weight: 700; color: #1e293b; }

.quarters-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.q-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px; text-align: center; }
.q-lbl { display: block; font-size: 0.6rem; color: #94a3b8; font-weight: 700; }
.q-val { font-size: 0.8rem; font-weight: 600; color: #475569; }

.month-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
.m-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px; text-align: center; }
.m-lbl { display: block; font-size: 0.55rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; }
.m-val { font-size: 0.75rem; font-weight: 600; color: #475569; }

/* NOTE */
.ai-notes-box { background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px; display: flex; gap: 10px; align-items: flex-start; margin-top: 5px; }
.notes-icon { font-size: 1.2rem; }
.ai-notes-box p { margin: 0; font-size: 0.85rem; color: #92400e; line-height: 1.4; }

/* Utilities */
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }

/* MODALI E FORM */
.compact-modal { max-width: 480px; }
.compact-header { padding: 0.8rem 1rem; background: #f8fafc; }
.compact-header h3 { font-size: 1.1rem; margin: 0; }
.compact-body { padding: 1rem; overflow-y: auto; max-height: 60vh; }
.compact-form { display: flex; flex-direction: column; gap: 8px; }
.role-selector-tiny { display: flex; background: #f1f5f9; padding: 3px; border-radius: 6px; margin-bottom: 10px; }
.role-opt { flex: 1; text-align: center; padding: 6px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-radius: 5px; transition: 0.2s; }
.role-opt.active { background: white; color: var(--accent); box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.role-opt input { display: none; }
.form-group label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px; font-weight: 600; }
.compact-input { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; background: white; }
.compact-input:focus { border-color: var(--accent); outline: none; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-grid-3 { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; }
.divider-micro { height: 1px; background: #e2e8f0; margin: 8px 0; }
.storage-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; }
.check-label { font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.storage-input { width: 80px; padding: 6px; font-size: 0.8rem; }
.legal-micro { display: flex; flex-direction: column; gap: 4px; font-size: 0.75rem; color: var(--text-muted); margin-top: 5px; }
.upload-section { background: #f8fafc; padding: 10px; border-radius: 6px; margin-top: 5px; border: 1px dashed #cbd5e1; }
.section-title { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; }
.file-input { font-size: 0.75rem; width: 100%; }
.compact-footer { padding: 0.8rem 1rem; background: #f1f5f9; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; }
.btn-save-small { background-color: #2563eb !important; color: #ffffff !important; opacity: 1 !important; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 0.9rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.btn-ghost-small { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; color: var(--text-muted); }

/* Common Modal */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.glass-modal { background: white; width: 95%; max-width: 550px; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.btn-close-modal { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }
.modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
.modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; flex-shrink: 0; }
.pdf-viewer-modal { max-width: 900px; height: 85vh; }
.modal-body-pdf { flex: 1; height: 100%; background: #f8fafc; }
.pdf-iframe { width: 100%; height: 100%; border: none; }
.pdf-loading { display: flex; align-items: center; justify-content: center; height: 100%; gap: 10px; color: var(--text-muted); }

/* Stile Pulsante Asset */
.btn-asset-nav {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    color: var(--text-muted);
    border-radius: 8px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    padding: 0;
}

.btn-asset-nav:hover {
    background: #e0f2fe;
    color: var(--accent);
    border-color: #bae6fd;
    transform: scale(1.05);
}

.btn-asset-nav .icon {
    line-height: 1;
    margin-top: -1px; /* Correzione ottica */
}

/* STILI PER LA NUOVA SEZIONE DI UPLOAD (EDIT MODE) */
.edit-upload-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.upload-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
}
.u-info {
    display: flex;
    flex-direction: column;
}
.u-status {
    font-size: 0.7rem;
    font-weight: 600;
}
.u-status.present { color: #16a34a; }
.u-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}
.file-input-compact {
    font-size: 0.75rem;
    max-width: 180px;
}
.btn-upload-action {
    background: var(--accent);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
}
.btn-upload-action:disabled {
    background: #94a3b8;
    cursor: not-allowed;
}

/* COMMUNITY TAGS */
.c-community-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
}

.comm-pill {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #eff6ff; 
    border: 1px solid #bfdbfe;
    color: #1e40af;      
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.2s ease;
    cursor: default;
}

.comm-pill:hover {
    background: #dbeafe;
    transform: translateY(-1px);
}

.cp-icon { font-size: 0.8rem; }

.cp-role-tag {
    font-size: 0.6rem;
    background: rgba(255,255,255,0.6);
    padding: 1px 4px;
    border-radius: 4px;
    margin-left: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* ASSET MODAL */
.asset-modal { width: 100%; max-width: 450px; height: 500px; display: flex; flex-direction: column; }
.header-title { display: flex; flex-direction: column; }
.subtitle-pod { font-size: 0.7rem; color: var(--accent); font-weight: 700; font-family: monospace; }
.asset-body { padding: 0; background: #f8fafc; flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Lista Asset */
.asset-list-view { padding: 1rem; height: 100%; display: flex; flex-direction: column; }
.assets-scroll-container { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.asset-row { background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
.asset-icon-box { width: 32px; height: 32px; background: #eff6ff; color: var(--accent); display: flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 1.1rem; }
.asset-info { flex: 1; }
.asset-name { font-size: 0.9rem; font-weight: 700; color: #334155; }
.asset-meta { font-size: 0.75rem; color: #94a3b8; display: flex; gap: 6px; align-items: center; }
.badge-type { background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; font-size: 0.65rem; }
.btn-delete-icon { background: none; border: none; color: #ef4444; opacity: 0.5; cursor: pointer; padding: 5px; }
.btn-delete-icon:hover { opacity: 1; background: #fef2f2; border-radius: 4px; }

.btn-dashed-add { border: 2px dashed #cbd5e1; background: none; width: 100%; padding: 10px; border-radius: 8px; color: #64748b; font-weight: 600; cursor: pointer; transition: 0.2s; margin-top: auto; }
.btn-dashed-add:hover { border-color: var(--accent); color: var(--accent); background: #eff6ff; }
.loading-state-small { padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; }

/* Empty State Small */
.empty-assets { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; }
.empty-icon-small { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; }
.btn-primary-small { 
    background-color: #2563eb !important;
    color: #ffffff !important;
    border: 1px solid #1d4ed8;
    padding: 10px 20px;
    border-radius: 8px; 
    cursor: pointer; 
    font-weight: 700;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    opacity: 1 !important;
    z-index: 10;
    transition: all 0.2s ease;
    margin-top: 15px;
}

.btn-primary-small:hover {
    background-color: #1d4ed8 !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
}

/* Form View Asset */
.asset-form-view { padding: 1.5rem; background: white; height: 100%; }
.form-title { margin: 0 0 1rem 0; font-size: 1.1rem; color: #334155; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.animate-up { animation: slideUp 0.3s ease-out; }

/* Styles for Edit/Delete Buttons */
.btn-icon-action {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: background 0.2s;
    font-size: 1rem;
}
.btn-icon-action.edit:hover { background-color: #e0f2fe; }
.btn-icon-action.delete:hover { background-color: #fee2e2; }

/* Animations */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(10px); }
.modal-slide-enter-active, .modal-slide-leave-active { transition: all 0.3s ease; }
.modal-slide-enter-from, .modal-slide-leave-to { opacity: 0; transform: translateY(20px); }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
.spinner-small { width: 24px; height: 24px; border: 3px solid #f3f3f3; border-top: 3px solid var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }
.loading-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.empty-state { text-align: center; padding: 3rem 1.5rem; display: flex; flex-direction: column; align-items: center; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }

/* --- [NUOVO] STILI ANIMAZIONE AI PROCESSING --- */
.ai-processing-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem;
    animation: fadeIn 0.5s ease;
}

.ai-animation-box {
    margin-bottom: 1.5rem;
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Magic Ring Animation */
.magic-ring {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e0e7ff, #eef2ff);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    animation: pulse-ring 2s infinite;
}

.magic-ring::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #6366f1;
    border-top-color: transparent;
    animation: spin 1.5s linear infinite;
}

.magic-sparkle {
    font-size: 2rem;
    animation: bounce 2s infinite;
}

.ai-processing-state h3 {
    color: #1e293b;
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
}

.ai-processing-state p {
    color: #64748b;
    font-size: 0.95rem;
    margin: 0;
}

.ai-processing-state .sub-text {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 5px;
}

/* Loader Bar */
.loader-bar {
    width: 100%;
    max-width: 250px;
    height: 6px;
    background: #f1f5f9;
    border-radius: 10px;
    margin-top: 1.5rem;
    overflow: hidden;
    position: relative;
}

.bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    width: 50%;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 10px;
    animation: load-bar 2s ease-in-out infinite;
}

@keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
    70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

@keyframes load-bar {
    0% { left: -50%; width: 50%; }
    50% { left: 25%; width: 50%; }
    100% { left: 100%; width: 50%; }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}

@media (max-width: 768px) {
    .desktop-menu, .desktop-actions { display: none !important; }
    .hamburger { display: flex; }
    .pods-grid { grid-template-columns: 1fr; }
    .main-content { padding: 4rem 1rem 2rem 1rem; }
    .page-header-compact { flex-direction: column; align-items: stretch; gap: 15px; }
    .header-left { text-align: center; }
    .btn-add-compact { width: 100%; padding: 12px; }
}
</style>