<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      
      <section class="hero-illustration fade-in delay-1">
        <svg viewBox="0 0 300 160" width="100%" height="160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="var(--accent-green)" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="var(--accent-green)" stop-opacity="0"/>
            </linearGradient>
            <filter id="glowGreen"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          <line x1="20" y1="140" x2="280" y2="140" stroke="var(--border-color)" stroke-width="1" />
          <line x1="20" y1="100" x2="280" y2="100" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4" opacity="0.5"/>
          <line x1="20" y1="60" x2="280" y2="60" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4" opacity="0.5"/>

          <path d="M20 120 Q60 130 100 90 T180 70 T280 40 V140 H20 Z" fill="url(#chartGradient)" class="fade-up-anim" />
          
          <path d="M20 120 Q60 130 100 90 T180 70 T280 40" fill="none" stroke="var(--accent-green)" stroke-width="3" stroke-linecap="round" filter="url(#glowGreen)" class="draw-anim" />

          <g class="float-animation">
            <circle cx="280" cy="40" r="6" fill="var(--bg-app)" stroke="var(--accent-green)" stroke-width="2" />
            <rect x="230" y="10" width="60" height="20" rx="4" fill="var(--accent-green)" />
            <text x="260" y="24" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">-12%</text>
          </g>
        </svg>
      </section>

      <section class="intro-section fade-in delay-2">
        <p class="intro-text">{{ $t('guide_market.intro.text') }}</p>
        <p class="intro-subtext">{{ $t('guide_market.intro.subtext') }}</p>
      </section>

      <section class="card pillar-card fade-in delay-3">
        <div class="card-header">
          <span class="icon-box">📉</span>
          <h2 class="card-title">{{ $t('guide_market.pun.title') }}<br><span class="highlight">{{ $t('guide_market.pun.subtitle') }}</span></h2>
        </div>
        
        <p class="card-description">{{ $t('guide_market.pun.desc') }}</p>

        <div class="pun-widget">
          <div class="pun-value">
            <span class="curr-val">0.098 €/kWh</span>
            <span class="trend negative">↓ 12%</span>
          </div>
          <div class="pun-bars">
             <div class="bar" style="height: 40%"></div>
             <div class="bar" style="height: 60%"></div>
             <div class="bar" style="height: 55%"></div>
             <div class="bar" style="height: 80%"></div>
             <div class="bar active" style="height: 35%"></div>
          </div>
          <div class="pun-label">{{ $t('guide_market.pun.last_update') }}</div>
        </div>
      </section>

      <section class="card pillar-card fade-in delay-4">
        <div class="card-header">
          <span class="icon-box">📰</span>
          <h2 class="card-title">{{ $t('guide_market.news.title') }}<br><span class="highlight">{{ $t('guide_market.news.subtitle') }}</span></h2>
        </div>

        <div class="news-list">
          <article class="news-item">
            <div class="news-meta">
              <span class="badge regulatory">{{ $t('guide_market.tags.regulatory') }}</span>
              <span class="date">{{ $t('guide_market.dates.today') }}</span>
            </div>
            <h4 class="news-title">{{ $t('guide_market.news.item1.title') }}</h4>
            <p class="news-desc">{{ $t('guide_market.news.item1.desc') }}</p>
          </article>

          <article class="news-item">
            <div class="news-meta">
              <span class="badge market">{{ $t('guide_market.tags.market') }}</span>
              <span class="date">{{ $t('guide_market.dates.yesterday') }}</span>
            </div>
            <h4 class="news-title">{{ $t('guide_market.news.item2.title') }}</h4>
            <p class="news-desc">{{ $t('guide_market.news.item2.desc') }}</p>
          </article>

          <article class="news-item">
             <div class="news-meta">
              <span class="badge tech">{{ $t('guide_market.tags.tech') }}</span>
              <span class="date">20 Ott</span>
            </div>
            <h4 class="news-title">{{ $t('guide_market.news.item3.title') }}</h4>
            <p class="news-desc">{{ $t('guide_market.news.item3.desc') }}</p>
          </article>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Assumiamo che GuideHeader sia registrato globalmente o importato qui
import GuideHeader from '@/components/layout/GuideHeader.vue';

const router = useRouter();
const isLightMode = ref(false);

onMounted(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  const savedTheme = localStorage.getItem('theme');
  isLightMode.value = savedTheme === 'light';
});
</script>

<style src="@/assets/css/main.css"></style>

<style scoped>
/* Copia e adattamento stili da IdentitaDigitale.vue */
.hero-illustration { margin-bottom: 24px; }
.intro-section { margin-bottom: 30px; }
.intro-text { font-size: 15px; line-height: 1.6; margin-bottom: 12px; }
.intro-subtext { font-size: 15px; color: var(--accent-green); font-weight: 600; }

.pillar-card { background-color: var(--bg-card-alt); display: flex; flex-direction: column; gap: 12px; }
.card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 4px; }

/* Icon Box sostituisce pillar-number per questo contesto */
.icon-box { 
  background: rgba(16, 185, 129, 0.1); 
  color: var(--accent-green); 
  font-size: 18px; 
  width: 32px; height: 32px; 
  border-radius: 8px; 
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
}

.card-title { font-size: 16px; font-weight: 600; margin: 0; color: var(--text-main); line-height: 1.3; }
.card-title .highlight { font-size: 13px; color: var(--accent-green); font-weight: 400; }
.card-description { font-size: 14px; color: var(--text-muted); line-height: 1.5; margin: 0; }

/* WIDGET PUN */
.pun-widget { background: var(--bg-app); border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-top: 8px; }
.pun-value { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.curr-val { font-size: 18px; font-weight: bold; color: var(--text-main); }
.trend { font-size: 14px; font-weight: 600; padding: 4px 8px; border-radius: 6px; }
.trend.negative { background: rgba(16, 185, 129, 0.15); color: #10b981; } /* Verde perché calo prezzo è buono */
.pun-bars { display: flex; gap: 8px; height: 60px; align-items: flex-end; margin-bottom: 8px; }
.bar { flex: 1; background: var(--border-color); border-radius: 4px; transition: height 1s; }
.bar.active { background: var(--accent-green); }
.pun-label { font-size: 11px; color: var(--text-muted); text-align: right; }

/* NEWS LIST */
.news-list { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
.news-item { padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
.news-item:last-child { border-bottom: none; padding-bottom: 0; }

.news-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.badge.regulatory { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.badge.market { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge.tech { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.date { font-size: 12px; color: var(--text-muted); }

.news-title { font-size: 15px; font-weight: 600; color: var(--text-main); margin: 0 0 4px 0; }
.news-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; margin: 0; }

/* Animazioni SVG */
.draw-anim { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 2s ease-out forwards; }
.fade-up-anim { opacity: 0; animation: fadeUp 1s ease-out 0.5s forwards; }
.float-animation { animation: floatY 3s ease-in-out infinite; }

@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
</style>