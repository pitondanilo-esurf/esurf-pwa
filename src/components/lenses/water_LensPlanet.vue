<template>
  <div class="cards-stack fade-in">
    <div class="premium-card planet-hero-card">
      <p class="insight-subtitle">Il tuo prelievo idrico annuo:</p>
      <div class="co2-visual">
        <h2 class="co2-number">{{ displayLiters }}</h2>
        <div class="co2-unit-box">
          <span class="co2-unit">Litri d'Acqua</span>
          <span class="co2-sub">analizzati dalla tua utenza</span>
        </div>
      </div>
      <div class="suv-comparison">
        <span class="suv-icon">🛁</span>
        <p>Equivale a riempire circa <strong class="text-planet">{{ bathtubs }} vasche da bagno</strong> ogni anno.</p>
      </div>
    </div>

    <div class="premium-card smart-card-planet hover-scale">
      <div class="smart-header">
        <div class="icon-box-small">🌊</div>
        <span class="smart-label">LA TUA OPPORTUNITÀ BLU</span>
      </div>
      <h4 class="smart-solution-title">Recupero e Riutilizzo</h4>
      <p class="smart-solution-desc">Sei sotto la media nazionale! Il tuo consumo è di circa <strong>{{ litersPerCapita }} litri al giorno per persona</strong>. Ottimo lavoro nella gestione della risorsa.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  targetVolumeMc: { type: Number, required: true },
  componentsNum: { type: Number, default: 1 }
});

const displayLiters = ref('0'); 
const totalLiters = computed(() => props.targetVolumeMc * 1000);
// Una vasca standard tiene circa 150 litri
const bathtubs = computed(() => Math.round(totalLiters.value / 150).toLocaleString('it-IT'));
// Calcolo litri pro capite al giorno
const litersPerCapita = computed(() => Math.round(totalLiters.value / 365 / props.componentsNum));

const animateLiters = () => {
  displayLiters.value = '0';
  let current = 0;
  const steps = 40;
  const increment = totalLiters.value / steps;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= totalLiters.value) {
      displayLiters.value = totalLiters.value.toLocaleString('it-IT');
      clearInterval(timer);
    } else {
      displayLiters.value = Math.round(current).toLocaleString('it-IT');
    }
  }, 25);
};

onMounted(() => {
  animateLiters();
});
</script>

<style scoped>
.cards-stack { display: flex; flex-direction: column; gap: 12px; }
.premium-card { padding: 14px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); transition: border-color 0.3s ease; }

.planet-hero-card {
  text-align: center;
  background: linear-gradient(180deg, var(--bg-card) 0%, rgba(6, 182, 212, 0.05) 100%);
  padding: 24px 16px;
  border-color: rgba(6, 182, 212, 0.3);
}
.insight-subtitle { font-size: 14px; font-weight: 700; color: var(--text-muted); margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }

.co2-visual { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; }
.co2-number { font-size: 64px; font-weight: 900; color: var(--text-primary); margin: 0; line-height: 1; letter-spacing: -2px; text-shadow: 0 4px 20px rgba(6, 182, 212, 0.2); }
.co2-unit-box { display: flex; flex-direction: column; align-items: center; margin-top: 4px; }
.co2-unit { font-size: 18px; font-weight: 800; color: #06b6d4; letter-spacing: 1px; }
.co2-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.suv-comparison { display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--bg-app); padding: 10px 14px; border-radius: 12px; font-size: 13px; color: var(--text-muted); line-height: 1.3; text-align: left; border: 1px solid var(--border-color); }
.suv-icon { font-size: 24px; }
.text-planet { color: #06b6d4; font-weight: 800; }
.smart-card-planet { background: linear-gradient(165deg, var(--bg-card) 50%, rgba(6, 182, 212, 0.12) 100%); border: 1px solid #06b6d4; }

.smart-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.icon-box-small { color: #06b6d4; width: 18px; height: 18px; font-size: 16px; }
.smart-label { font-size: 10px; font-weight: 900; color: #06b6d4; letter-spacing: 1px; }
.smart-solution-title { font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
.smart-solution-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0; }
</style>