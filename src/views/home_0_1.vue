<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content">
      <div class="header-section fade-in delay-1">
        <p class="subtitle-revolut">{{ $t('v0.home.subtitle') }}</p>
        <h1 class="title-revolut">{{ $t('v0.home.main_title') }}</h1>
      </div>

      <div class="cards-stack fade-in delay-2">
        
        <button class="revo-card card-wallet hover-scale" @click="goToLoadBill('wallet')">
          <div class="card-tag tag-wallet">{{ $t('v0.home.lens_wallet') }}</div>
          <div class="card-header">
            <div class="icon-circle icon-wallet">📉</div>
            <h2>{{ $t('v0.home.goal_cost') }}</h2>
          </div>
          <p class="card-body">{{ $t('v0.home.desc_cost') }}</p>
        </button>

        <button class="revo-card card-planet hover-scale" @click="goToLoadBill('planet')">
          <div class="card-tag tag-planet">{{ $t('v0.home.lens_planet') }}</div>
          <div class="card-header">
            <div class="icon-circle icon-planet">🌿</div>
            <h2>{{ $t('v0.home.goal_emissions') }}</h2>
          </div>
          <p class="card-body">{{ $t('v0.home.desc_emissions') }}</p>
        </button>

        <button class="revo-card card-shield hover-scale" @click="goToLoadBill('shield')">
          <div class="card-tag tag-shield">{{ $t('v0.home.lens_shield') }}</div>
          <div class="card-header">
            <div class="icon-circle icon-shield">🛡️</div>
            <h2>{{ $t('v0.home.goal_independence') }}</h2>
          </div>
          <p class="card-body">{{ $t('v0.home.desc_independence') }}</p>
        </button>

      </div>
    </main>

    <BottomNavbar class="fade-in delay-3" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';

const router = useRouter();

const { t } = useI18n();

const goToLoadBill = (goalType) => {
  localStorage.setItem('esurf_selected_lens', goalType);
  router.push('/loadbill');
};
</script>

<style>
/* Importazione forzata per la fase di presviluppo */
@import '@/assets/main_V0.css';
</style>

<style scoped>
/* Reset base e stile card */
.revo-card {
  width: 100%;
  text-align: left;
  font: inherit;
  outline: none;
  cursor: pointer;
  padding: 24px;
  border-radius: 24px;
  background: var(--bg-card);
  
  /* RESET BOTTONE: spegne i bordi ostinati del browser */
  -webkit-appearance: none;
  appearance: none;
  
  /* BORDER ESPLICITO per forzare la variabile del main_V0.css */
  border-width: 1px;
  border-style: solid;
  border-color: var(--border-color);
  
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.3s ease;
  position: relative;
  overflow: hidden;
  color: var(--text-primary); /* Punto e virgola inserito per evitare la rottura del CSS */
}

.header-section { margin: 10px 0 32px 0; }
.cards-stack { display: flex; flex-direction: column; gap: 16px; }

.card-tag { font-size: 11px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
.card-header h2 { font-size: 17px; font-weight: 800; margin: 0; letter-spacing: -0.3px; }
.card-body { font-size: 14px; color: var(--text-muted); margin: 0; line-height: 1.5; }
.icon-circle { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }

/* Gradienti gestiti localmente che leggono la variabile globale --bg-card */
.card-wallet { 
  background: linear-gradient(160deg, var(--bg-card) 40%, rgba(245, 158, 11, 0.2) 100%); 
}
.card-planet { 
  background: linear-gradient(160deg, var(--bg-card) 40%, rgba(16, 185, 129, 0.2) 100%); 
}
.card-shield { 
  background: linear-gradient(160deg, var(--bg-card) 40%, rgba(59, 130, 246, 0.2) 100%); 
}

.tag-wallet { color: var(--accent-gold); }
.icon-wallet { background: rgba(245, 158, 11, 0.1); }

.tag-planet { color: var(--accent-green); }
.icon-planet { background: rgba(16, 185, 129, 0.1); }

.tag-shield { color: var(--accent-blue); }
.icon-shield { background: rgba(59, 130, 246, 0.1); }
</style>