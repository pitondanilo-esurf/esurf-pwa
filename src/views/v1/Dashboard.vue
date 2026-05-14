<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content">
      <div v-if="loading" class="loading-state fade-in">
        <div class="spinner"></div>
        <p>Sincronizzazione Hub di Comando...</p>
      </div>

      <template v-else>
        <section class="address-section fade-in">
          <div class="address-selector hover-scale">
            <div class="address-info">
              <span class="label">NUCLEO ATTIVO:</span>
              <div class="address-value">
                <svg class="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{{ activeAddressName }}</span>
              </div>
            </div>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            
            <select v-model="activeAddressId" @change="handleAddressChange" class="hidden-select">
              <option v-for="group in groupedResources" :key="group.id" :value="group.id">
                {{ group.address }} ({{ group.items.length }})
              </option>
            </select>
          </div>
        </section>

        <section class="global-status-section fade-in delay-1">
          <div class="status-card">
            <div class="status-text">
              <span class="status-label">Status Globale Nucleo:</span>
              <h2 class="status-level">{{ globalStatusTitle }}</h2>
            </div>
            <div class="status-icon-wrapper">
              <div class="glow-ring"></div>
              <span class="medal-icon">{{ globalStatusIcon }}</span>
            </div>
          </div>
        </section>

        <section class="dynamic-menu fade-in delay-2">
          <h3 class="section-title">MENU OPERATIVO (Smart Tiles)</h3>
          
          <div class="tiles-grid">
            <div v-if="hasActivePower" class="smart-tile tile-urgent">
              <div class="tile-header">
                <div class="title-with-icon">
                  <span class="icon-pulse">⚡</span>
                  <h4>MERCATO FLESSIBILITÀ</h4>
                </div>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="status-alert">⚡ DISPONIBILITÀ: ATTIVA</p>
                <p class="detail-row">Prossima Asta: <strong>Oggi ore 16:00</strong></p>
                <p class="detail-row">Potenziale guadagno: <strong class="highlight">€ 12/h</strong></p>
              </div>
            </div>

            <div v-if="hasPendingResources" class="smart-tile tile-warning">
              <div class="tile-header">
                <h4>📋 CENTRO AZIONI (CTA)</h4>
                <div class="badge-count">{{ pendingCount }}</div>
              </div>
              <div class="tile-body">
                <p class="action-desc">Mancano deleghe fondamentali per sbloccare la piena operatività del nucleo.</p>
                <button class="btn-action-small" @click="goToResourceManagement">Gestisci Firme</button>
              </div>
            </div>

            <div class="smart-tile tile-standard" @click="goToResourceManagement">
              <div class="tile-header">
                <h4>🎛️ GESTIONE RISORSE</h4>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Visualizza e configura tutti i contatori Luce, Gas e Acqua di questo indirizzo.</p>
                <button class="btn-action-small btn-resource-nav" @click.stop="goToResourceManagement">
                  Gestisci le risorse ({{ activeAddressResources.length }})
                </button>
              </div>
            </div>

            <div class="smart-tile tile-standard">
              <div class="tile-header">
                <h4>🏅 MATURITY HUB (VETTORI)</h4>
              </div>
              <div class="tile-body">
                <div class="vectors-row">
                  <template v-if="resourcePower">
                    <div class="vector-item pointer hover-scale" @click.stop="openResourceCompliance('energia_elettrica')">
                      <span class="v-icon icon-dark">⚡</span>
                      <span class="v-name">Energia</span>
                      <span class="v-level" :class="'text-' + getLevel(resourcePower)">{{ resourcePower.compliance_data?.level || 'Bronze' }}</span>
                    </div>
                    <div v-if="resourceGas || resourceWater" class="vector-line"></div>
                  </template>

                  <template v-if="resourceGas">
                    <div class="vector-item pointer hover-scale" @click.stop="openResourceCompliance('gas')">
                      <span class="v-icon icon-dark" style="color: #f97316;">🔥</span>
                      <span class="v-name">Gas</span>
                      <span class="v-level" :class="'text-' + getLevel(resourceGas)">{{ resourceGas.compliance_data?.level || 'Bronze' }}</span>
                    </div>
                    <div v-if="resourceWater" class="vector-line"></div>
                  </template>

                  <template v-if="resourceWater">
                    <div class="vector-item pointer hover-scale" @click.stop="openResourceCompliance('acqua')">
                      <span class="v-icon icon-dark" style="color: #3b82f6;">💧</span>
                      <span class="v-name">Acqua</span>
                      <span class="v-level" :class="'text-' + getLevel(resourceWater)">{{ resourceWater.compliance_data?.level || 'Bronze' }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>

          </div>
        </section>
      </template>
    </main>

    <BottomNavbar class="fade-in delay-3" />
    
    <PodComplianceModal 
        :show="showComplianceModal" 
        :complianceData="selectedCompliance" 
        @close="closeComplianceModal" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';
import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';
import PodComplianceModal from '@/components/pods/PodComplianceModal.vue';

const router = useRouter();

const loading = ref(true);
const resources = ref([]);
const activeAddressId = ref('');
const showComplianceModal = ref(false);
const selectedCompliance = ref(null);

const groupedResources = computed(() => {
    const groups = {};
    resources.value.forEach(r => {
        let aiData = {};
        try { aiData = typeof r.ai_analysis === 'string' ? JSON.parse(r.ai_analysis) : (r.ai_analysis || {}); } catch (e) {}
        const aiAddr = aiData?.indirizzo || {};
        
        const via = aiAddr.Via ? aiAddr.Via.trim() : (r.address ? r.address.trim() : '');
        const civico = aiAddr.NumeroCivico ? aiAddr.NumeroCivico.trim() : '';
        const citta = aiAddr.Città ? aiAddr.Città.trim() : (r.city ? r.city.trim() : '');
        const prov = aiAddr.Provincia ? aiAddr.Provincia.trim() : (r.province ? r.province.trim() : '');
        
        let displayCity = `${citta} ${prov ? '('+prov+')' : ''}`.trim();
        let displayStreet = `${via} ${civico}`.trim();
        
        let displayAddress = displayCity && displayStreet ? `${displayCity}, ${displayStreet}` : (displayCity || displayStreet || 'Indirizzo Sconosciuto');
        displayAddress = displayAddress.replace(/\s+/g, ' ').trim();

        let normKey = `${citta} ${via}`.toLowerCase().replace(/[^\w\s]/gi, ' ').replace(/\b(di|del|della|dei|degli|via|viale|piazza|corso)\b/g, ' ').replace(/\b[a-z]{2}\b/g, ' ').replace(/\d+/g, ' ').replace(/\s+/g, ' ').trim();
        if (!normKey) normKey = 'unknown_location';

        if (!groups[normKey]) groups[normKey] = { id: normKey, address: displayAddress, items: [] };
        else if (displayAddress.length > groups[normKey].address.length) groups[normKey].address = displayAddress;
        groups[normKey].items.push(r);
    });
    return Object.values(groups).sort((a, b) => a.address.localeCompare(b.address));
});

const activeAddressGroup = computed(() => groupedResources.value.find(g => g.id === activeAddressId.value) || groupedResources.value[0] || { address: 'Nessun Nucleo Attivo', items: [] });
const activeAddressResources = computed(() => activeAddressGroup.value.items);
const activeAddressName = computed(() => activeAddressGroup.value.address);

const resourcePower = computed(() => activeAddressResources.value.find(r => !r.resource_type || r.resource_type === 'energia_elettrica'));
const resourceGas = computed(() => activeAddressResources.value.find(r => r.resource_type === 'gas'));
const resourceWater = computed(() => activeAddressResources.value.find(r => r.resource_type === 'acqua'));

const hasActivePower = computed(() => resourcePower.value?.status === 'active');
const hasPendingResources = computed(() => activeAddressResources.value.some(r => r.status !== 'active'));
const pendingCount = computed(() => activeAddressResources.value.filter(r => r.status !== 'active').length);

const globalStatusTitle = computed(() => `MEMBER ${(resourcePower.value?.compliance_data?.level || 'BRONZE').toUpperCase()}`);
const globalStatusIcon = computed(() => {
  const l = (resourcePower.value?.compliance_data?.level || 'bronze').toLowerCase();
  return l.includes('silver') ? '🥈' : (l.includes('gold') ? '🥇' : (l.includes('platinum') ? '💎' : '🥉'));
});

onMounted(async () => {
  try {
    loading.value = true;
    const [userRes, resRes] = await Promise.all([ AuthService.getUser(), axios.get('/api/resources') ]);
    resources.value = resRes.data.data || resRes.data || [];

    if (groupedResources.value.length > 0) {
      const savedId = localStorage.getItem('esurf_active_address_id');
      if (savedId && groupedResources.value.some(g => g.id === savedId)) activeAddressId.value = savedId;
      else activeAddressId.value = groupedResources.value[0].id;
    }
  } catch (error) {
    if (error.response?.status === 401) router.push('/login');
  } finally {
    loading.value = false;
  }
});

const handleAddressChange = () => { localStorage.setItem('esurf_active_address_id', activeAddressId.value); };
const goToResourceManagement = () => { router.push({ path: '/resources', query: { back: '/hub' } }); };
const openResourceCompliance = (type) => {
  const res = activeAddressResources.value.find(r => type === 'energia_elettrica' ? (!r.resource_type || r.resource_type === type) : r.resource_type === type);
  if (res?.compliance_data) {
    selectedCompliance.value = res.compliance_data;
    showComplianceModal.value = true;
  }
};
const closeComplianceModal = () => { showComplianceModal.value = false; selectedCompliance.value = null; };
const getLevel = (res) => (res?.compliance_data?.level || 'bronze').toLowerCase();
</script>

<style scoped>
@import '@/assets/main_V0.css';

.main-content { padding: 16px; max-width: 480px; margin: 0 auto; padding-bottom: 90px; }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); font-weight: 600; }
.address-section { margin-bottom: 20px; }
.address-selector { position: relative; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-shadow: var(--shadow-card); }
.hidden-select { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; appearance: none; }
.label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
.address-value { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--text-primary); }
.pin-icon { width: 16px; height: 16px; color: var(--accent-cyan); flex-shrink: 0; }
.chevron { width: 20px; height: 20px; color: var(--text-muted); pointer-events: none; flex-shrink: 0; }
.global-status-section { margin-bottom: 24px; }
.status-card { background: linear-gradient(135deg, var(--bg-card) 0%, rgba(255,255,255,0.05) 100%); border: 1px solid var(--border-color); border-radius: 16px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
.status-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
.status-level { font-size: 18px; font-weight: 900; color: #e2e8f0; margin: 4px 0 0 0; letter-spacing: 0.5px; }
.status-icon-wrapper { position: relative; width: 48px; height: 48px; display: flex; justify-content: center; align-items: center; }
.glow-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #94a3b8; animation: pulse-ring 2s infinite cubic-bezier(0.4, 0, 0.6, 1); }
.medal-icon { font-size: 28px; z-index: 1; }
@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
.section-title { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; padding-left: 4px; }
.tiles-grid { display: flex; flex-direction: column; gap: 12px; }
.smart-tile { background: var(--bg-card); border-radius: 16px; padding: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-card); transition: transform 0.2s; cursor: pointer; }
.smart-tile:active { transform: scale(0.98); }
.tile-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.tile-header h4 { font-size: 13px; font-weight: 800; margin: 0; color: var(--text-primary); letter-spacing: 0.5px; }
.nav-arrow { width: 18px; height: 18px; color: var(--text-muted); }
.tile-body { font-size: 13px; color: var(--text-muted); }
.detail-row { margin: 4px 0; }
.detail-row strong { color: var(--text-primary); }
.tile-urgent { border-color: var(--accent-blue); background: linear-gradient(160deg, var(--bg-card) 40%, rgba(59, 130, 246, 0.15) 100%); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
.title-with-icon { display: flex; align-items: center; gap: 8px; }
.icon-pulse { animation: pulse-opacity 1.5s infinite; }
.status-alert { color: var(--accent-blue); font-weight: 800; font-size: 11px; margin-bottom: 8px; letter-spacing: 0.5px; }
.highlight { color: #10b981 !important; font-size: 15px; }
@keyframes pulse-opacity { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
.tile-warning { border-color: rgba(245, 158, 11, 0.5); border-left: 4px solid #f59e0b; }
.badge-count { background: #f59e0b; color: white; font-size: 11px; font-weight: 800; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; border-radius: 50%; }
.action-desc { font-size: 12px; margin-bottom: 12px; line-height: 1.4; }
.btn-action-small { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; cursor: pointer; }
.btn-resource-nav { margin-top: 8px; width: 100%; text-align: center; border-color: rgba(59, 130, 246, 0.4); color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); transition: all 0.2s; }
.btn-resource-nav:hover { background: rgba(59, 130, 246, 0.2); }

.vectors-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.vector-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.v-icon { font-size: 20px; background: var(--bg-app); width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; border-radius: 50%; border: 1px solid var(--border-color); }
.icon-dark { background: #1a1a1a; border-color: #333; color: #fbbf24; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
.v-name { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.v-level { font-size: 11px; font-weight: 800; }
.vector-line { flex-grow: 1; height: 1px; background: dashed 1px var(--border-color); margin: 0 10px; margin-bottom: 20px; opacity: 0.5; }

.text-silver { color: #94a3b8; } .text-bronze { color: #b45309; } .text-platinum { color: #38bdf8; } .text-gold { color: #d4af37; } .text-wallet { color: #d4af37; } .pointer { cursor: pointer; }
</style>