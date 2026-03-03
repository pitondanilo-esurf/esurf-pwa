<template>
  <div class="dashboard-block market-news-block">
    <div class="block-header">
      <div class="icon-bg">📈</div>
      <h3>{{ $t('blocks.features.market.title') }}</h3>
    </div>
    
    <p class="block-description">
      {{ $t('blocks.features.market.description') }}
    </p>

    <div class="news-list">
      <div class="news-item">
        <span class="news-date">{{ $t('guide_market.dates.today') }}</span>
        <div class="news-content">
          <strong>{{ $t('guide_market.news.item1.title') }}</strong>
          <p>{{ $t('guide_market.news.item1.desc') }}</p>
        </div>
      </div>

      <div class="news-item">
        <span class="news-date">{{ $t('guide_market.dates.yesterday') }}</span>
        <div class="news-content">
          <strong>{{ $t('guide_market.news.item2.title') }}</strong>
          <p>{{ $t('guide_market.news.item2.desc') }}</p>
        </div>
      </div>
    </div>

    <button class="action-btn" @click="goToMarketGuide">
      {{ $t('blocks.features.market.button') }}
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
// Non serve destrutturare 't' se usi $t nel template, ma lo lasciamo per sicurezza
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n(); 

const goToMarketGuide = () => {
  router.push('/guide/mercato'); 
};
</script>

<style scoped>
/* ... (il tuo stile css rimane invariato) ... */
.dashboard-block {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dashboard-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.block-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.icon-bg {
  width: 40px;
  height: 40px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
}

.block-description {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  flex-grow: 1;
  overflow: hidden;
}

.news-item {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.news-item:last-child {
  border-bottom: none;
}

.news-date {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-blue);
  min-width: 35px;
  padding-top: 2px;
}

.news-content {
  overflow: hidden; 
}

.news-content strong {
  display: block;
  font-size: 13px;
  color: var(--text-main);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-content p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.action-btn {
  margin-top: auto;
  background: transparent;
  border: 1px solid var(--accent-blue);
  color: var(--accent-blue);
  padding: 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-btn:hover {
  background: var(--accent-blue);
  color: white;
}
</style>