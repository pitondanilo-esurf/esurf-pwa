<template>
  <div class="admin-wrapper">
    <div class="content">
      <header class="page-header flex-header">
        <div>
          <h1>Gestione Impianti</h1>
          <p>Amministrazione anagrafica, stato e chiavi API inverter.</p>
        </div>
        <button @click="apriModaleCreazione" class="btn-admin">+ Nuovo Impianto</button>
      </header>

      <div class="admin-card list-box">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Stato</th>
                <th>Impianto</th>
                <th>BESS (Storage)</th>
                <th>Integrazione</th>
                <th class="text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="imp in impianti" :key="imp.pod_id">
                <td>
                  <span :class="imp.attivo ? 'status-badge active' : 'status-badge disabled'">
                    {{ imp.attivo ? 'ATTIVO' : 'SOSPESO' }}
                  </span>
                </td>
                <td>
                  <strong class="text-white">{{ imp.nome_impianto }}</strong><br>
                  <small class="text-gray">{{ imp.potenza_picco_kwp }} kWp - {{ imp.pod_id }}</small>
                </td>
                <td>
                  <span v-if="imp.has_bess" class="status-badge active">🔋 {{ imp.bess_capacity_kwh }} kWh</span>
                  <span v-else class="text-gray">No</span>
                </td>
                <td><span class="status-badge brand-badge">{{ imp.brand }}</span></td>
                <td class="text-right">
                  <button @click="apriModaleModifica(imp)" class="btn-text text-blue">Modifica</button>
                  <button @click="eliminaImpianto(imp.pod_id)" class="btn-text text-red ml-2">Elimina</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="impianti.length === 0" class="empty-text">Nessun impianto configurato.</div>
      </div>

      <div v-if="modaleAperto" class="modal-overlay">
        <div class="admin-card modal-content">
          <div class="modal-header">
            <div class="flex-align gap-3">
              <h3>{{ isEditing ? 'Modifica' : 'Nuovo' }} Impianto</h3>
              
              <label class="status-toggle">
                <input type="checkbox" v-model="form.attivo">
                <span class="slider"></span>
                <small :class="form.attivo ? 'text-green' : 'text-gray'">
                  {{ form.attivo ? 'Impianto Attivo' : 'Impianto Sospeso' }}
                </small>
              </label>
            </div>
            
            <button @click="chiudiModale" class="btn-close">&times;</button>
          </div>

          <div class="admin-form p-4">
            <div class="form-row">
              <div>
                <label class="input-label">POD ID</label>
                <input v-model="form.pod_id" :disabled="isEditing" placeholder="POD ID" class="inp">
              </div>
              <div>
                <label class="input-label">Nome Impianto</label>
                <input v-model="form.nome_impianto" placeholder="Nome Impianto" class="inp">
              </div>
            </div>
            
            <div class="form-row">
              <div>
                <label class="input-label">CER ID</label>
                <input v-model="form.cer_id" placeholder="es. CER_01" class="inp">
              </div>
              <div>
                <label class="input-label">Potenza (kWp)</label>
                <input v-model="form.potenza_picco_kwp" type="number" step="0.1" placeholder="Potenza kWp" class="inp">
              </div>
            </div>

            <div class="form-row">
              <div>
                <label class="input-label">Brand Inverter</label>
                <select v-model="form.brand" class="inp">
                  <option value="SolarEdge">SolarEdge</option>
                  <option value="Huawei">Huawei</option>
                  <option value="Fronius">Fronius</option>
                </select>
              </div>
            </div>

            <div class="bess-section mt-4">
              <label class="flex-align text-white mb-3 cursor-pointer">
                <input type="checkbox" v-model="form.has_bess" class="mr-2"> Presenza Accumulo (BESS)
              </label>
              
              <div v-if="form.has_bess" class="form-row animate-fade">
                <div>
                  <label class="input-label">Capacità (kWh)</label>
                  <input v-model="form.bess_capacity_kwh" type="number" step="0.1" placeholder="es. 20" class="inp">
                </div>
                <div>
                  <label class="input-label">Potenza Max (kW)</label>
                  <input v-model="form.bess_max_power_kw" type="number" step="0.1" placeholder="es. 5" class="inp">
                </div>
              </div>
            </div>

            <hr class="divider">
            
            <div class="form-row">
              <div>
                <label class="input-label">Site ID Inverter</label>
                <input v-model="form.api_site_id" placeholder="Site ID" class="inp">
              </div>
              <div>
                <label class="input-label">API Key</label>
                <div class="flex-gap">
                  <input v-model="form.api_key" type="password" placeholder="Chiave segreta API" class="inp flex-1">
                  <button @click="testaConnessione" :disabled="isTesting" class="btn-test">
                    {{ isTesting ? '...' : 'Test' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="testResult" class="test-box mt-2" :class="testResult.success ? 'success-msg' : 'error-msg'">
               {{ testResult.message }}
            </div>

            <div class="modal-footer mt-4">
              <button @click="salvaImpianto" class="btn-admin w-full">
                {{ isEditing ? 'Aggiorna Impianto' : 'Salva Impianto' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AdminService from '@/services/AdminService.js';

const impianti = ref([]);
const modaleAperto = ref(false);
const isEditing = ref(false);
const isTesting = ref(false);
const testResult = ref(null);

// Inizializzazione completa con tutti i nuovi campi
const formBase = {
  pod_id: '', 
  attivo: true, 
  cer_id: '', 
  nome_impianto: '', 
  potenza_picco_kwp: 3.0,
  brand: 'SolarEdge', 
  api_site_id: '', 
  api_key: '',
  has_bess: false,
  bess_capacity_kwh: null,
  bess_max_power_kw: null
};

const form = ref({ ...formBase });

onMounted(async () => {
  await caricaImpianti();
});

const caricaImpianti = async () => {
  try {
    const res = await AdminService.getImpianti();
    // Convertiamo 'attivo' in booleano (nel caso il db ritorni 0/1)
    impianti.value = res.data.map(imp => ({
      ...imp,
      attivo: Boolean(imp.attivo),
      has_bess: Boolean(imp.has_bess)
    }));
  } catch (error) {
    console.error("Errore nel caricamento impianti:", error);
  }
};

const apriModaleCreazione = () => {
  isEditing.value = false;
  form.value = { ...formBase };
  testResult.value = null;
  modaleAperto.value = true;
};

const apriModaleModifica = (impianto) => {
  isEditing.value = true;
  form.value = { ...impianto, api_key: '' };
  testResult.value = null;
  modaleAperto.value = true;
};

const chiudiModale = () => modaleAperto.value = false;

const testaConnessione = async () => {
  if (!form.value.api_site_id || (!form.value.api_key && !isEditing.value)) {
    testResult.value = { success: false, message: "Inserisci Site ID e API Key." };
    return;
  }
  isTesting.value = true;
  testResult.value = null;
  try {
    const res = await AdminService.testConnection({
      api_site_id: form.value.api_site_id, 
      api_key: form.value.api_key, 
      brand: form.value.brand
    });
    
    testResult.value = { success: true, message: res.data.message || "L'inverter risponde correttamente!" };
  } catch (error) {
    testResult.value = { success: false, message: error.response?.data?.message || "Connessione rifiutata. Controlla le credenziali." };
  } finally {
    isTesting.value = false;
  }
};

const salvaImpianto = async () => {
  try {
    if (isEditing.value) {
      await AdminService.updateImpianto(form.value.pod_id, form.value);
    } else {
      await AdminService.createImpianto(form.value);
    }
    chiudiModale();
    await caricaImpianti();
  } catch (error) {
    alert(error.response?.data?.message || error.response?.data?.error || "Errore di salvataggio.");
  }
};

const eliminaImpianto = async (pod_id) => {
  if (confirm("Sicuro di voler eliminare questo impianto?")) {
    try {
      await AdminService.deleteImpianto(pod_id); 
      await caricaImpianti();
    } catch (error) {
      alert("Errore durante l'eliminazione.");
    }
  }
};
</script>

<style scoped>
/* Layout Base ereditato da AdminDashboard */
.admin-wrapper { min-height: 100vh; background: #0f172a; color: white; font-family: 'Inter', sans-serif; }
.content { max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem; }
.flex-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.flex-align { display: flex; align-items: center; }
.gap-3 { gap: 1rem; }

/* Tipografia */
h1 { margin: 0; color: #f8fafc; }
.page-header p { color: #94a3b8; font-size: 0.9rem; margin-top: 5px; }
.text-white { color: #f8fafc; }
.text-gray { color: #94a3b8; }
.text-blue { color: #60a5fa; }
.text-red { color: #f87171; }
.text-green { color: #10b981; }

/* Cards & Moduli */
.admin-card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; }
.table-responsive { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { padding: 12px 15px; border-bottom: 2px solid #334155; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; }
.admin-table td { padding: 15px; border-bottom: 1px solid #334155; vertical-align: middle; }
.admin-table tr:hover { background: rgba(51, 65, 85, 0.4); }

/* Badge Stati */
.status-badge { font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; }
.status-badge.active { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.status-badge.disabled { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.brand-badge { background: #334155; color: #f8fafc; }

/* Toggle Switch per Stato Attivo */
.status-toggle { display: flex; align-items: center; cursor: pointer; }
.status-toggle input { display: none; }
.slider {
  width: 38px;
  height: 22px;
  background-color: #475569;
  border-radius: 20px;
  position: relative;
  transition: 0.3s;
  margin-right: 10px;
}
.slider:before {
  content: "";
  position: absolute;
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}
input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(16px); }

/* Form Elements */
.admin-form { display: flex; flex-direction: column; gap: 15px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.input-label { display: block; font-size: 0.8rem; font-weight: bold; color: #94a3b8; margin-bottom: 5px; }
.inp { padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; width: 100%; box-sizing: border-box; }
.inp:disabled { opacity: 0.5; cursor: not-allowed; }

/* Bottoni */
.btn-admin { padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-admin:hover { background: #2563eb; }
.btn-text { background: none; border: none; cursor: pointer; font-weight: 600; font-size: 0.9rem; padding: 0; transition: 0.2s; }
.btn-text:hover { filter: brightness(1.2); }
.btn-test { background: #334155; color: white; border: 1px solid #475569; padding: 0 15px; border-radius: 8px; cursor: pointer; transition: 0.2s; white-space: nowrap; }
.btn-test:hover:not(:disabled) { background: #475569; }
.btn-test:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-close { background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; }
.btn-close:hover { color: white; }

/* Utilities */
.flex-gap { display: flex; gap: 10px; }
.flex-1 { flex: 1; }
.text-right { text-align: right; }
.ml-2 { margin-left: 10px; }
.mt-2 { margin-top: 10px; }
.mt-4 { margin-top: 20px; }
.w-full { width: 100%; }
.cursor-pointer { cursor: pointer; }
.divider { border: 0; border-top: 1px solid #334155; margin: 20px 0; }
.empty-text { text-align: center; color: #94a3b8; padding: 2rem; }

/* Messaggi */
.test-box { padding: 10px; border-radius: 6px; font-size: 0.85rem; text-align: center; font-weight: bold;}
.error-msg { color: #fca5a5; background: rgba(127, 29, 29, 0.3); }
.success-msg { color: #6ee7b7; background: rgba(6, 78, 59, 0.3); }

/* Modale Overlay */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100; backdrop-filter: blur(2px); }
.modal-content { width: 100%; max-width: 650px; padding: 0; overflow: hidden; max-height: 90vh; overflow-y: auto;}
.modal-header { padding: 20px; background: #0f172a; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; color: white; }
.admin-form { padding: 20px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #334155; }
</style>