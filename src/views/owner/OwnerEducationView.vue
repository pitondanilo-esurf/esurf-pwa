<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
        <header class="page-header-compact fade-in delay-1" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <div class="header-left">
                <h2 style="margin:0; font-size: 1.8rem;">{{ $t('ownerEducation.title') }}</h2>
                <p style="margin: 5px 0 0 0; color: var(--text-muted);">{{ $t('ownerEducation.subtitle') }}</p>
            </div>
            <button @click="$router.push('/owner/dashboard')" class="btn-ghost-small">
                {{ $t('ownerEducation.backToDash') }}
            </button>
        </header>

        <div class="content-area fade-in delay-2">
            
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>{{ $t('common.loading') }}</p>
            </div>

            <div v-else class="catalog-grid">
                <div v-for="block in blocks" :key="block.id" class="card block-card">
                    <div class="card-body block-body">
                        <div class="block-icon">{{ block.icon || '📦' }}</div>
                        <div class="block-info">
                            <h4>{{ block.name }}</h4>
                            <p>{{ block.description }}</p>
                            <span class="tech-tag">{{ block.component_key }}</span>
                        </div>
                        <div class="block-action">
                            <label class="switch">
                                <input 
                                    type="checkbox" 
                                    :checked="block.is_enabled" 
                                    @change="toggleBlock(block, $event)"
                                    :disabled="togglingId === block.id"
                                >
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/services/axios';
import GuideHeader from '@/components/layout/GuideHeader.vue';

const isLightMode = ref(false);
const loading = ref(true);
const blocks = ref([]);
const togglingId = ref(null);

onMounted(async () => {
    const savedTheme = localStorage.getItem('theme');
    isLightMode.value = savedTheme === 'light';
    if (isLightMode.value) document.body.classList.add('light-mode');

    await fetchCatalog();
});

const fetchCatalog = async () => {
    try {
        const res = await axios.get('/api/communities/blocks');
        blocks.value = res.data;
    } catch (e) {
        console.error("Errore catalogo:", e);
    } finally {
        loading.value = false;
    }
};

const toggleBlock = async (block, event) => {
    const newState = event.target.checked;
    togglingId.value = block.id; // Disabilita switch durante la chiamata API

    try {
        await axios.post('/api/communities/blocks/toggle', {
            block_id: block.id,
            is_enabled: newState
        });
        block.is_enabled = newState; // Conferma stato locale
    } catch (e) {
        console.error("Errore toggle:", e);
        event.target.checked = !newState; // Revert in caso di errore
        alert("Impossibile aggiornare lo stato.");
    } finally {
        togglingId.value = null;
    }
};
</script>

<style src="@/assets/css/main.css"></style>
<style scoped>
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1.5rem 4rem 1.5rem; max-width: 1000px; margin: 0 auto; }

.btn-ghost-small { background: var(--bg-card); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; color: var(--text-muted); transition: 0.2s; }
.btn-ghost-small:hover { color: var(--text-main); border-color: var(--text-main); }

.catalog-grid { display: flex; flex-direction: column; gap: 15px; }
.block-card { background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color); transition: border-color 0.2s; }
.block-card:hover { border-color: var(--accent-blue); }

.block-body { display: flex; align-items: center; gap: 20px; padding: 20px; }
.block-icon { font-size: 2.5rem; background: rgba(59, 130, 246, 0.1); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 12px; flex-shrink: 0; }
.block-info { flex: 1; }
.block-info h4 { margin: 0 0 5px 0; font-size: 1.1rem; color: var(--text-main); }
.block-info p { margin: 0 0 8px 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.4; }
.tech-tag { font-size: 0.7rem; font-family: monospace; background: var(--bg-app); padding: 2px 6px; border-radius: 4px; color: var(--accent-cyan); border: 1px solid var(--border-color); }

/* SWITCH TOGGLE CSS */
.switch { position: relative; display: inline-block; width: 50px; height: 28px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--bg-app); border: 1px solid var(--border-color); transition: .4s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: var(--text-muted); transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--accent-blue); border-color: var(--accent-blue); }
input:checked + .slider:before { transform: translateX(22px); background-color: white; }
input:disabled + .slider { opacity: 0.5; cursor: not-allowed; }

.loading-state { text-align: center; padding: 4rem; color: var(--text-muted); }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border-color); border-top: 4px solid var(--accent-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* RESPONSIVE */
@media (max-width: 600px) {
    .block-body { flex-direction: column; text-align: center; }
    .block-action { width: 100%; display: flex; justify-content: flex-end; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px; }
}
</style>