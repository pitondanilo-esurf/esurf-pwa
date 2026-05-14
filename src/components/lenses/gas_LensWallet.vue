<template>
  <div class="cards-stack fade-in">
    <div class="premium-card wallet-hero-card">
      <p class="insight-subtitle">Potenziale di risparmio annuo sul Gas:</p>
      <div class="wallet-visual">
        <h2 class="wallet-number">€ {{ optimizationAmount.toLocaleString('it-IT') }}</h2>
        <span class="wallet-unit">Euro</span>
      </div>
      <p class="wallet-context">Riducendo gli sprechi termici in base al tuo uso ({{ usageType }}).</p>
    </div>

    <div class="premium-card smart-card-wallet hover-scale">
      <div class="smart-header">
        <div class="icon-box-small">🔥</div>
        <span class="smart-label">OTTIMIZZAZIONE TERMICA</span>
      </div>
      <p class="smart-solution-desc">Il tuo contratto è a <strong>prezzo variabile</strong>. L'AI consiglia di monitorare le fluttuazioni del mercato invernale per valutare un blocco tariffario o gestire meglio i gradi in casa.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  optimizationAmount: { type: Number, default: 150 },
  usageType: { type: String, default: 'Riscaldamento' }
});
</script>

<style scoped>
.cards-stack { display: flex; flex-direction: column; gap: 12px; }
.premium-card { padding: 14px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); transition: border-color 0.3s ease; }

.wallet-hero-card {
  text-align: center;
  background: linear-gradient(180deg, var(--bg-card) 0%, rgba(245, 158, 11, 0.08) 100%);
  padding: 24px 16px;
  border-color: rgba(245, 158, 11, 0.3);
}
.insight-subtitle { font-size: 14px; font-weight: 700; color: var(--text-muted); margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }

.wallet-visual { margin: 16px 0; }
.wallet-number { font-size: 56px; font-weight: 900; color: #f59e0b; margin: 0; line-height: 1; letter-spacing: -2px; }
.wallet-unit { font-size: 16px; font-weight: 800; color: var(--text-muted); }
.wallet-context { font-size: 13px; color: var(--text-muted); margin-top: 10px; font-style: italic; }
.smart-card-wallet { border: 1px solid #f59e0b; background: linear-gradient(165deg, var(--bg-card) 50%, rgba(245, 158, 11, 0.12) 100%); }

.smart-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.icon-box-small { color: #f59e0b; width: 18px; height: 18px; font-size: 16px; }
.smart-label { font-size: 10px; font-weight: 900; color: #f59e0b; letter-spacing: 1px; }
.smart-solution-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0; }
</style>