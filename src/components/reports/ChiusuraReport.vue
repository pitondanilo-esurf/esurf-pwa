<template>
  <div class="report-page end-page" :class="{ 'light-mode': isLightMode }">
    <div class="end-content">
      <h2 class="contacts-title">Contatti</h2>
      <div class="contact-list">
        <p class="contact-item"><strong>Email:</strong> info@energy-surf.it</p>
        <p class="contact-item"><strong>Tel:</strong> +39 391 708 5697</p>
        <p class="contact-item"><strong>P.IVA:</strong> 7777777777</p>
        <p class="contact-item"><strong>Sede:</strong> Torino, OGR</p>
      </div>
      
      <div class="end-visual">
        <div class="visual-line"></div>
        <div class="visual-dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLightMode: { type: Boolean, default: false }
});
</script>

<style scoped>
.report-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  page-break-before: always;
  background: var(--bg-app, #0A0C0E);
  color: var(--text-primary, #F0F2F5);
}

.contacts-title {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: var(--accent-gold, #C8A850);
  margin-bottom: 30px;
}

.contact-list {
  font-size: 16px;
  line-height: 2;
}

.contact-item {
  margin: 5px 0;
  color: var(--text-primary);
}

.contact-item strong {
  color: var(--text-muted, #8A8B90);
  font-weight: 400;
  margin-right: 8px;
}

.end-visual {
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.visual-line {
  width: 1px;
  height: 60px;
  background: linear-gradient(to bottom, var(--accent-gold), transparent);
}

.visual-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-gold);
  border-radius: 50%;
}
</style>