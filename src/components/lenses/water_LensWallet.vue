<template>
  <div class="cards-stack fade-in">
    <div class="premium-card wallet-hero-card">
      <p class="insight-subtitle">Potenziale di risparmio annuo sull'Acqua:</p>
      <div class="wallet-visual">
        <h2 class="wallet-number">€ {{ optimizationAmount.toLocaleString('it-IT') }}</h2>
        <span class="wallet-unit">Euro</span>
      </div>
      <p class="wallet-context">Ottimizzando i flussi ed evitando dispersioni occulte ({{ usageType }}).</p>
    </div>

    <div class="premium-card smart-card-wallet hover-scale">
      <div class="smart-header">
        <div class="icon-box-small">💧</div>
        <span class="smart-label">EFFICIENZA IDRICA</span>
      </div>
      <p class="smart-solution-desc">L'AI ha rilevato un nucleo di <strong>{{ componentsNum }} persone</strong>. Con l'installazione di riduttori di flusso potresti tagliare i costi di acquedotto e depurazione del 20%.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  optimizationAmount: { type: Number, default: 45 },
  usageType: { type: String, default: 'Domestico residente' },
  componentsNum: { type: Number, default: 1 }
});
</script>

<style scoped>
.cards-stack { display: flex; flex-direction: column; gap: 12px; }
.premium-card { padding: 14px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); transition: border-color 0.3s ease; }

.wallet-hero-card {
  text-align: center;
  background: linear-gradient(180deg, var(--bg-card) 0%, rgba(6, 182, 212, 0.08) 100%);
  padding: 24px 16px;
  border-color: rgba(6, 182, 212, 0.3);
}
.insight-subtitle { font-size: 14px; font-weight: 700; color: var(--text-muted); margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }

.wallet-visual { margin: 16px 0; }
.wallet-number { font-size: 56px; font-weight: 900; color: #06b6d4; margin: 0; line-height: 1; letter-spacing: -2px; }
.wallet-unit { font-size: 16px; font-weight: 800; color: var(--text-muted); }
.wallet-context { font-size: 13px; color: var(--text-muted); margin-top: 10px; font-style: italic; }
.smart-card-wallet { border: 1px solid #06b6d4; background: linear-gradient(165deg, var(--bg-card) 50%, rgba(6, 182, 212, 0.12) 100%); }

.smart-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.icon-box-small { color: #06b6d4; width: 18px; height: 18px; font-size: 16px; }
.smart-label { font-size: 10px; font-weight: 900; color: #06b6d4; letter-spacing: 1px; }
.smart-solution-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0; }
</style>