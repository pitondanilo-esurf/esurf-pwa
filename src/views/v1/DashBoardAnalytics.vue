<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content">
      <div v-if="loading" class="loading-state fade-in">
        <div class="spinner"></div>
        <p>Caricamento Modelli Analitici...</p>
      </div>

      <template v-else>
        <section class="address-section fade-in">
          <div class="address-selector hover-scale">
            <div class="address-info">
              <span class="label">NUCLEO IN ANALISI:</span>
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

        <section class="dynamic-menu fade-in delay-1">
          <h3 class="section-title">STRUMENTI DI ANALISI (Advanced)</h3>
          
          <div class="tiles-grid">
            
            <div class="smart-tile tile-standard" @click="goToImpactDashboard">
              <div class="tile-header">
                <h4>📈 DASHBOARD IMPATTO</h4>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc mb-2">Simula il ritorno sull'investimento (ROI) di pannelli solari e pompe di calore in base alla tua spesa reale.</p>
                <p class="detail-row">Consumo annuo stimato: <strong class="text-wallet">{{ resourcePower?.annual_consumption_kwh || 'N/D' }} kWh</strong></p>
              </div>
            </div>

            <div class="smart-tile tile-standard" @click="goToVectorDashboard">
              <div class="tile-header">
                <h4>📐 MODELLO VETTORIALE 2D</h4>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Analizza le tue bollette come vettori nello spazio economico-ambientale per comprendere il tuo orientamento.</p>
              </div>
            </div>

            <div class="smart-tile tile-standard" @click="goToLeontiefDashboard">
              <div class="tile-header">
                <h4>🔢 MODELLO LEONTIEF I/O</h4>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Scopri i costi nascosti (indotti) delle tue utenze analizzando le interdipendenze tramite la Matrice A.</p>
              </div>
            </div>

            <div class="smart-tile tile-standard" @click="goToLeontiefReport">
              <div class="tile-header">
                <h4>📑 REPORT LEONTIEF EXECUTIVE</h4>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Genera un report esecutivo di sintesi dell'analisi Input-Output con raccomandazioni strategiche sui consumi.</p>
              </div>
            </div>

            <div class="smart-tile tile-standard" @click="goToLeontiefReportAdvanced">
              <div class="tile-header">
                <h4>📑 REPORT LEONTIEF AVANZATO</h4>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Genera un report analitico dettagliato dell'analisi Input-Output con raccomandazioni strategiche sui consumi.</p>
              </div>
            </div>

            <div class="smart-tile tile-standard" @click="goToCerLeontief">
              <div class="tile-header">
                <div class="title-with-icon">
                  <span class="icon-pulse">🔋</span>
                  <h4>ANALISI CER (Input/Output)</h4>
                </div>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Simula l'impatto di una Comunità Energetica sulla tua matrice di dipendenza e calcola l'incentivo GSE condiviso.</p>
              </div>
            </div>

            <div class="smart-tile tile-standard" @click="goToLeontiefTEE">
              <div class="tile-header">
                <div class="title-with-icon">
                  <span class="icon-pulse">🌍</span>
                  <h4>ANALISI TEE (7 LAYER)</h4>
                </div>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Modello Leontief dinamico a Z settori per il calcolo dei Titoli di Efficienza Energetica (TEE) e dei risparmi indotti.</p>
              </div>
            </div>

            <div class="smart-tile tile-standard" @click="goToPvRoi">
              <div class="tile-header">
                <div class="title-with-icon">
                  <span class="icon-pulse">☀️</span>
                  <h4>ANALISI ROI FOTOVOLTAICO</h4>
                </div>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Assessment interattivo per calcolare il ritorno sull'investimento (ROI) di un impianto fotovoltaico con i tuoi consumi reali estratti dall'AI.</p>
              </div>
            </div>
            <div class="smart-tile tile-standard" @click="goToPvCERRoi">
              <div class="tile-header">
                <div class="title-with-icon">
                  <span class="icon-pulse">☀️</span>
                  <h4>ANALISI ROI FOTOVOLTAICO + CER</h4>
                </div>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Assessment interattivo per calcolare il ritorno sull'investimento (ROI) di un impianto fotovoltaico con i tuoi consumi reali estratti dall'AI.</p>
              </div>
            </div>
            <div class="smart-tile tile-standard" @click="goToPvRoiFuture">
              <div class="tile-header">
                <div class="title-with-icon">
                  <span class="icon-pulse">☀️</span>
                  <h4>ANALISI ROI FOTOVOLTAICO - Future Profiling</h4>
                </div>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Assessment interattivo per calcolare il ritorno sull'investimento (ROI) di un impianto fotovoltaico con i tuoi consumi reali estratti dall'AI.</p>
              </div>
            </div>
            <div class="smart-tile tile-standard" @click="goToBessRoi">
              <div class="tile-header">
                <div class="title-with-icon">
                  <span class="icon-pulse">🔋</span>
                  <h4>ANALISI ROI BESS su FOTOVOLTAICO esistente</h4>
                </div>
                <svg class="nav-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div class="tile-body">
                <p class="action-desc">Assessment interattivo per calcolare il ritorno sull'investimento (ROI) di un impianto BESS su fotovoltaico esistente con i tuoi valori di produzione.</p>
              </div>
            </div>

          </div>
        </section>
      </template>
    </main>

    <BottomNavbar class="fade-in delay-2" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/axios';
import AuthService from '@/services/AuthService';
import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

const router = useRouter();
const loading = ref(true);
const resources = ref([]);
const activeAddressId = ref('');

// --- LOGICA RAGGRUPPAMENTO NUCLEO ---
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

const resourcePower = computed(() => activeAddressResources.value.find(r => !r.resource_type || ['power', 'energia_elettrica', 'luce', 'energia'].includes(String(r.resource_type).toLowerCase())));

// --- NAVIGAZIONE ---
const goToImpactDashboard = () => { router.push({ path: '/impact', query: { back: '/analytics' } }); };
const goToVectorDashboard = () => { router.push({ path: '/vectors', query: { back: '/analytics' } }); };
const goToLeontiefDashboard = () => { router.push({ path: '/leontief', query: { back: '/analytics' } }); };
const goToLeontiefReport = () => { router.push({ path: '/leontief-report', query: { back: '/analytics' } }); };
const goToLeontiefReportAdvanced = () => { router.push({ path: '/leontief-report-advanced', query: { back: '/analytics' } }); };
const goToCerLeontief = () => { router.push({ path: '/cer-leontief', query: { back: '/analytics' } }); };
const goToLeontiefTEE = () => { router.push({ path: '/leontief-tee', query: { back: '/analytics' } }); };
const goToPvRoi = () => { router.push({ path: '/pv-roi', query: { back: '/analytics' } }); };
const goToPvCERRoi = () => { router.push({ path: '/pv-roi-cer', query: { back: '/analytics' } }); };

const goToPvRoiFuture = () => { router.push({ path: '/pv-roiFuture', query: { back: '/analytics' } }); };
const goToBessRoi = () => { router.push({ path: '/add-bess-roi', query: { back: '/analytics' } }); };

onMounted(async () => {
  try {
    loading.value = true;
    await Promise.all([ AuthService.getUser(), axios.get('/api/resources') ]).then(([_, resRes]) => {
      resources.value = resRes.data.data || resRes.data || [];
    });

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
</script>

<style scoped>
@import '@/assets/main_V0.css';

.main-content { padding: 16px; max-width: 480px; margin: 0 auto; padding-bottom: 90px; }

/* ANIMAZIONI E SPINNER */
.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state { text-align: center; padding: 4rem 1rem; color: var(--text-muted); font-weight: 600; }

/* SELETTORE INDIRIZZO */
.address-section { margin-bottom: 24px; }
.address-selector { position: relative; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; box-shadow: var(--shadow-card); }
.hidden-select { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; appearance: none; }
.label { font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 4px; }
.address-value { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: var(--text-primary); }
.pin-icon { width: 16px; height: 16px; color: var(--accent-cyan); flex-shrink: 0; }
.chevron { width: 20px; height: 20px; color: var(--text-muted); pointer-events: none; flex-shrink: 0; }

/* CARDS STILE FINTECH */
.section-title { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; padding-left: 4px; }
.tiles-grid { display: flex; flex-direction: column; gap: 12px; }
.smart-tile { background: var(--bg-card); border-radius: 16px; padding: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-card); transition: transform 0.2s; cursor: pointer; }
.smart-tile:active { transform: scale(0.98); }
.tile-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.tile-header h4 { font-size: 13px; font-weight: 800; margin: 0; color: var(--text-primary); letter-spacing: 0.5px; }
.nav-arrow { width: 18px; height: 18px; color: var(--text-muted); }
.tile-body { font-size: 13px; color: var(--text-muted); }
.action-desc { font-size: 12px; margin: 0; line-height: 1.5; }
.detail-row { margin: 6px 0 0 0; font-size: 11px; }

/* UTILS */
.mb-2 { margin-bottom: 8px; }
.text-wallet { color: #d4af37; }
</style>