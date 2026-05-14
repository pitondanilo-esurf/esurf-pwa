<template>
  <section class="f-widget-card hover-lift" @click="goToMarketGuide">
    
    <div class="f-widget-header">
      <div class="f-widget-icon">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
          <polyline points="16 7 22 7 22 13"></polyline>
        </svg>
      </div>
      <div class="f-widget-title-area">
        <h3 class="f-widget-title">{{ $t('blocks.features.market.title') }}</h3>
        <p class="f-widget-subtitle">{{ $t('blocks.features.market.description') }}</p>
      </div>
      <div class="f-action-circle">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </div>

    <div class="f-divider"></div>

    <div class="f-news-list">
      
      <div class="f-news-item">
        <div class="f-news-date">{{ $t('guide_market.dates.today') }}</div>
        <div class="f-news-content">
          <h4 class="f-news-title">{{ $t('guide_market.news.item1.title') }}</h4>
          <p class="f-news-desc">{{ $t('guide_market.news.item1.desc') }}</p>
        </div>
      </div>

      <div class="f-news-item">
        <div class="f-news-date">{{ $t('guide_market.dates.yesterday') }}</div>
        <div class="f-news-content">
          <h4 class="f-news-title">{{ $t('guide_market.news.item2.title') }}</h4>
          <p class="f-news-desc">{{ $t('guide_market.news.item2.desc') }}</p>
        </div>
      </div>

    </div>

  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n(); 

const goToMarketGuide = () => {
  router.push('/guide/mercato?back=/guides'); 
};
</script>

<style scoped>
/* --- FINTECH WIDGET CARD --- */
.f-widget-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.f-widget-card:hover {
  border-color: #10b981; /* Verde smeraldo in hover per il tema market */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* --- HEADER WIDGET --- */
.f-widget-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.f-widget-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981; /* Smeraldo */
  display: flex;
  justify-content: center;
  align-items: center;
}

.f-widget-title-area {
  flex: 1;
}

.f-widget-title {
  margin: 0 0 4px 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.f-widget-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}

/* --- AZIONE (FRECCIA) --- */
.f-action-circle {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.f-widget-card:hover .f-action-circle {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

/* --- DIVISORE --- */
.f-divider {
  height: 1px;
  background: var(--border-color);
  margin: 16px 0;
  opacity: 0.6;
}

/* --- NEWS LIST --- */
.f-news-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.f-news-item {
  display: flex;
  gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--border-color);
}

.f-news-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.f-news-date {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #10b981;
  min-width: 45px;
  padding-top: 2px;
  letter-spacing: 0.5px;
}

.f-news-content {
  flex: 1;
  overflow: hidden;
}

.f-news-title {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.f-news-desc {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 480px) {
  .f-widget-card { padding: 16px; }
  .f-widget-icon { width: 38px; height: 38px; }
  .f-widget-title { font-size: 0.95rem; }
  .f-news-item { gap: 10px; }
  .f-news-date { min-width: 38px; font-size: 0.6rem; }
}
</style>