<template>
  <div class="cards-stack fade-in">
    <div class="premium-card wallet-hero-card">
      <p class="insight-subtitle">Il tuo potenziale di ottimizzazione annuo:</p>
      <div class="wallet-visual">
        <h2 class="wallet-number">€ {{ optimizationAmount.toLocaleString('it-IT') }}</h2>
        <span class="wallet-unit">Euro</span>
      </div>
      <p class="wallet-context">È come se avessi coperto tutti i costi del gas per un intero anno.</p>
    </div>

    <div class="premium-card smart-card-wallet hover-scale">
      <div class="smart-header">
        <div class="icon-box-small">💎</div>
        <span class="smart-label">LA TUA OPPORTUNITÀ DI WALLET</span>
      </div>
      <p class="smart-solution-desc">Attiva l'<strong>integrazione bancaria</strong> per ottimizzare il 15% delle tue spese ricorrenti.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  // Pronto per essere dinamico quando vorrai calcolarlo dal backend!
  optimizationAmount: { type: Number, default: 2400 }
});
</script>

<style scoped>
.cards-stack { display: flex; flex-direction: column; gap: 12px; }
.premium-card { padding: 14px; border-radius: 20px; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-card); transition: border-color 0.3s ease; }

.wallet-hero-card {
  text-align: center;
  background: linear-gradient(180deg, var(--bg-card) 0%, rgba(212, 175, 55, 0.08) 100%);
  padding: 24px 16px;
  border-color: rgba(212, 175, 55, 0.3);
}
.insight-subtitle { font-size: 14px; font-weight: 700; color: var(--text-muted); margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }

.wallet-visual { margin: 16px 0; }
.wallet-number { font-size: 56px; font-weight: 900; color: var(--accent); margin: 0; line-height: 1; letter-spacing: -2px; }
.wallet-unit { font-size: 16px; font-weight: 800; color: var(--text-muted); }
.wallet-context { font-size: 13px; color: var(--text-muted); margin-top: 10px; font-style: italic; }
.smart-card-wallet { border: 1px solid var(--accent); background: linear-gradient(165deg, var(--bg-card) 50%, rgba(212, 175, 55, 0.12) 100%); }

.smart-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.icon-box-small { color: var(--accent); width: 18px; height: 18px; font-size: 16px; }
.smart-label { font-size: 10px; font-weight: 900; color: var(--accent); letter-spacing: 1px; }
.smart-solution-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0; }
</style>