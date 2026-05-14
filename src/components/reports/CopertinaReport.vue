<template>
  <div class="report-page cover-page" :class="{ 'light-mode': isLightMode }">
    <svg class="cover-bg" viewBox="0 0 500 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <circle cx="500" cy="0" r="300" fill="var(--accent-gold)" opacity="0.05" />
    </svg>

    <div class="cover-content">
      <div class="brand-logo">E-surf</div>
      <div class="title-group">
        <h1 class="report-title">{{ titolo }}</h1>
        <p class="report-subtitle">{{ sottotitolo }}</p>
      </div>
    </div>

    <footer class="report-footer">
      <div class="footer-line"></div>
      <div class="footer-text">
        <span>© {{ currentYear }} Energy-Surf S.r.l.</span>
        <span>Documento Riservato</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';

defineProps({
  titolo: { type: String, required: true },
  sottotitolo: { type: String, default: '' },
  isLightMode: { type: Boolean, default: false }
});

const currentYear = new Date().getFullYear();
</script>

<style scoped>
.report-page {
  position: relative;
  width: 100%;
  height: 100vh; /* Forza la pagina intera */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  box-sizing: border-box;
  page-break-after: always; /* Fondamentale per la stampa */
  overflow: hidden;
  background: var(--bg-app, #0A0C0E);
  color: var(--text-primary, #F0F2F5);
}

.cover-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.cover-content {
  position: relative;
  z-index: 1;
}

.brand-logo {
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  color: var(--accent-gold, #C8A850);
  font-size: 24px;
  margin-bottom: 100px;
}

.report-title {
  font-size: 48px;
  font-weight: 300;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -1px;
}

.report-subtitle {
  font-size: 18px;
  color: var(--text-muted, #8A8B90);
  margin-top: 20px;
  max-width: 80%;
}

.report-footer {
  position: absolute;
  bottom: 60px;
  left: 60px;
  right: 60px;
}

.footer-line {
  height: 1px;
  background: var(--border-color, #232830);
  margin-bottom: 15px;
}

.footer-text {
  display: flex;
  justify-content: space-between;
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  color: var(--text-light, #5A5D65);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Print Overrides */
@media print {
  .report-page { height: 100vh !important; }
}
</style>