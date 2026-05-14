<template>
  <div class="cards-stack fade-in">
    <div class="premium-card planet-hero-card">
      <p class="insight-subtitle">La tua impronta termica annua:</p>
      <div class="co2-visual">
        <h2 class="co2-number">{{ displayCo2 }}</h2>
        <div class="co2-unit-box">
          <span class="co2-unit">Tonnellate di CO2</span>
          <span class="co2-sub">generate dal riscaldamento</span>
        </div>
      </div>
      <div class="suv-comparison">
        <span class="suv-icon">🌳</span>
        <p>Servirebbero circa <strong class="text-planet">{{ treesNeeded }} alberi</strong> per assorbire queste emissioni ogni anno.</p>
      </div>
    </div>

    <div class="premium-card smart-card-planet hover-scale">
      <div class="smart-header">
        <div class="icon-box-small">💎</div>
        <span class="smart-label">LA TUA OPPORTUNITÀ GREEN</span>
      </div>
      <h4 class="smart-solution-title">Transizione Termica</h4>
      <p class="smart-solution-desc">Sapevi che abbassando la temperatura di mandata dell'acqua potresti tagliare le emissioni del <strong>12%</strong> senza perdere comfort?</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  targetCo2: { type: Number, required: true }
});

const displayCo2 = ref('0.0'); 
// Stima: un albero assorbe circa 20kg di CO2 all'anno.
const treesNeeded = computed(() => Math.round((props.targetCo2 * 1000) / 20).toLocaleString('it-IT'));

const animateCo2 = () => {
  displayCo2.value = '0.0';
  let current = 0;
  const steps = 40;
  const increment = props.targetCo2 / steps;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= props.targetCo2) {
      displayCo2.value = props.targetCo2.toFixed(1);
      clearInterval(timer);
    } else {
      displayCo2.value = current.toFixed(1);
    }
  }, 25);
};

onMounted(() => {
  animateCo2();
});
</script>

<style scoped>
.cards-stack { display: flex; flex-direction: column; gap: 12px; }
.premium-card { padding: 14px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); transition: border-color 0.3s ease; }

.planet-hero-card {
  text-align: center;
  background: linear-gradient(180deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%);
  padding: 24px 16px;
  border-color: rgba(16, 185, 129, 0.3);
}
.insight-subtitle { font-size: 14px; font-weight: 700; color: var(--text-muted); margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }

.co2-visual { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; }
.co2-number { font-size: 84px; font-weight: 900; color: var(--text-primary); margin: 0; line-height: 1; letter-spacing: -3px; text-shadow: 0 4px 20px rgba(16, 185, 129, 0.2); }
.co2-unit-box { display: flex; flex-direction: column; align-items: center; margin-top: 4px; }
.co2-unit { font-size: 18px; font-weight: 800; color: #10b981; letter-spacing: 1px; }
.co2-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

.suv-comparison { display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--bg-app); padding: 10px 14px; border-radius: 12px; font-size: 13px; color: var(--text-muted); line-height: 1.3; text-align: left; border: 1px solid var(--border-color); }
.suv-icon { font-size: 24px; }
.text-planet { color: #10b981; font-weight: 800; }
.smart-card-planet { background: linear-gradient(165deg, var(--bg-card) 50%, rgba(16, 185, 129, 0.12) 100%); border: 1px solid #10b981; }

.smart-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.icon-box-small { color: #10b981; width: 18px; height: 18px; font-size: 16px; }
.smart-label { font-size: 10px; font-weight: 900; color: #10b981; letter-spacing: 1px; }
.smart-solution-title { font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
.smart-solution-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0; }
</style>