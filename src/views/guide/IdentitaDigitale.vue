<template>
  <div class="app-container">
    <GuideHeader :isLightMode="isLightMode" />

    <main class="main-content">
      <section class="hero-illustration fade-in delay-1">
        <svg viewBox="0 0 300 160" width="100%" height="160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bronze" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#CD7F32"/><stop offset="100%" stop-color="#8B4513"/></linearGradient>
            <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E0E0E0"/><stop offset="100%" stop-color="#9E9E9E"/></linearGradient>
            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#B8860B"/></linearGradient>
            <linearGradient id="platinum" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00f2fe"/><stop offset="100%" stop-color="#4facfe"/></linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          <circle cx="150" cy="80" r="70" fill="none" stroke="var(--accent-blue)" stroke-width="1" opacity="0.2" class="pulse-ring" />
          
          <path d="M40 120 L90 100 L120 115 L70 135 Z" fill="url(#bronze)" opacity="0.8" />
          <text x="75" y="120" fill="#fff" font-size="8" font-weight="bold" transform="rotate(15 75 120)">BRONZE</text>
          
          <path d="M80 100 L130 80 L160 95 L110 115 Z" fill="url(#silver)" opacity="0.9" />
          <text x="115" y="100" fill="#000" font-size="8" font-weight="bold" transform="rotate(15 115 100)">SILVER</text>
          
          <path d="M120 80 L170 60 L200 75 L150 95 Z" fill="url(#gold)" />
          <text x="155" y="80" fill="#000" font-size="8" font-weight="bold" transform="rotate(15 155 80)">GOLD</text>
          
          <path d="M160 60 L210 40 L240 55 L190 75 Z" fill="url(#platinum)" filter="url(#glow)" class="float-animation" />
          <text x="195" y="60" fill="#000" font-size="8" font-weight="bold" transform="rotate(15 195 60)" class="float-animation">PLATINUM</text>
          
          <g transform="translate(195, 20) scale(0.6)" filter="url(#glow)" class="float-animation">
            <path d="M10 0 h20 v10 c0 15 -20 15 -20 0 Z" fill="var(--accent-cyan)" />
            <path d="M15 10 v15 h10 v-15" fill="var(--accent-blue)" />
            <rect x="10" y="25" width="20" height="5" fill="var(--accent-cyan)" />
          </g>
        </svg>
      </section>

      <section class="intro-section fade-in delay-2">
        <p class="intro-text">{{ $t('identita.intro.text') }}</p>
        <p class="intro-subtext">{{ $t('identita.intro.subtext') }}</p>
      </section>

      <section class="card pillar-card fade-in delay-3">
        <div class="card-header">
          <span class="pillar-number">1</span>
          <h2 class="card-title">{{ $t('identita.pillar1.title') }}<br><span class="highlight">{{ $t('identita.pillar1.highlight') }}</span></h2>
        </div>
        <p class="card-description">{{ $t('identita.pillar1.desc') }}</p>
        <ul class="feature-list">
          <li><strong>{{ $t('identita.pillar1.list.cer_label') }}</strong> {{ $t('identita.pillar1.list.cer_desc') }}</li>
          <li><strong>{{ $t('identita.pillar1.list.flex_label') }}</strong> {{ $t('identita.pillar1.list.flex_desc') }}</li>
          <li><strong>{{ $t('identita.pillar1.list.market_label') }}</strong> {{ $t('identita.pillar1.list.market_desc') }}</li>
        </ul>
      </section>

      <section class="card pillar-card fade-in delay-4">
        <div class="card-header">
          <span class="pillar-number">2</span>
          <h2 class="card-title">{{ $t('identita.pillar2.title') }}<br><span class="highlight">{{ $t('identita.pillar2.highlight') }}</span></h2>
        </div>
        <p class="card-description">{{ $t('identita.pillar2.desc') }}</p>
        <div class="compliance-list">
          <div class="compliance-item">
            <div class="comp-label">{{ $t('identita.pillar2.items.legality.label') }} <span class="badge">30 pt</span></div>
            <div class="comp-desc">{{ $t('identita.pillar2.items.legality.desc') }}</div>
          </div>
          <div class="compliance-item">
            <div class="comp-label">{{ $t('identita.pillar2.items.grid.label') }} <span class="badge">18 pt</span></div>
            <div class="comp-desc">{{ $t('identita.pillar2.items.grid.desc') }}</div>
          </div>
          <div class="compliance-item">
            <div class="comp-label">{{ $t('identita.pillar2.items.bill.label') }} <span class="badge">15 pt</span></div>
          </div>
          <div class="compliance-item">
            <div class="comp-label">{{ $t('identita.pillar2.items.curves.label') }} <span class="badge">25 pt</span></div>
            <div class="comp-desc">{{ $t('identita.pillar2.items.curves.desc') }}</div>
          </div>
          <div class="compliance-item">
            <div class="comp-label">{{ $t('identita.pillar2.items.assets.label') }} <span class="badge">12 pt</span></div>
            <div class="comp-desc">{{ $t('identita.pillar2.items.assets.desc') }}</div>
          </div>
        </div>
      </section>

      <section class="card pillar-card fade-in delay-5">
        <div class="card-header">
          <span class="pillar-number">3</span>
          <h2 class="card-title">{{ $t('identita.pillar3.title') }}<br><span class="highlight">{{ $t('identita.pillar3.highlight') }}</span></h2>
        </div>
        <p class="card-description">{{ $t('identita.pillar3.desc') }}</p>
        <div class="tier-list">
          <div class="tier-item bronze-tier">
            <strong>BRONZE:</strong> {{ $t('identita.pillar3.tiers.bronze') }}
          </div>
          <div class="tier-item silver-tier">
            <strong>SILVER:</strong> {{ $t('identita.pillar3.tiers.silver') }}
          </div>
          <div class="tier-item gold-tier">
            <strong>GOLD:</strong> {{ $t('identita.pillar3.tiers.gold') }}
          </div>
          <div class="tier-item platinum-tier">
            <strong>PLATINUM:</strong> {{ $t('identita.pillar3.tiers.platinum') }}
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
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
/* Animazioni specifiche per l'SVG della Hero in questa pagina */
.hero-illustration { margin-bottom: 24px; }
.float-animation { animation: floatY 3s ease-in-out infinite; }
.pulse-ring { animation: pulseScale 4s ease-out infinite; transform-origin: center; }

@keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes pulseScale { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }

.intro-section { margin-bottom: 30px; }
.intro-text { font-size: 15px; line-height: 1.6; margin-bottom: 12px; }
.intro-subtext { font-size: 15px; color: var(--accent-blue); font-weight: 600; }

.pillar-card { background-color: var(--bg-card-alt); }
.card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.pillar-number { background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue)); color: var(--text-inverse); font-weight: bold; font-size: 18px; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.card-title { font-size: 16px; font-weight: 600; margin: 0; color: var(--text-main); line-height: 1.3; }
.card-title .highlight { font-size: 13px; color: var(--accent-blue); font-weight: 400; }
.card-description { font-size: 14px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5; }

.feature-list { padding-left: 20px; margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.6; }
.feature-list li { margin-bottom: 10px; }
.feature-list strong { color: var(--text-main); }

.compliance-list { display: flex; flex-direction: column; gap: 12px; }
.compliance-item { background: rgba(128,128,128,0.05); padding: 12px; border-radius: 8px; }
.comp-label { font-weight: 600; color: var(--text-main); display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 14px; }
.badge { background: var(--bg-app); color: var(--accent-blue); padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; border: 1px solid var(--accent-blue); }
.comp-desc { font-size: 13px; color: var(--text-muted); line-height: 1.4; }

.tier-list { display: flex; flex-direction: column; gap: 10px; }
.tier-item { padding: 12px 16px; border-radius: 8px; font-size: 13px; line-height: 1.5; border-left: 4px solid transparent; background: rgba(128,128,128,0.05); color: var(--text-main); }
.tier-item strong { font-size: 14px; display: block; margin-bottom: 4px; }

.bronze-tier { border-left-color: #CD7F32; }
.bronze-tier strong { color: #CD7F32; }
.silver-tier { border-left-color: #C0C0C0; }
.silver-tier strong { color: #9E9E9E; }
.gold-tier { border-left-color: #FFD700; }
.gold-tier strong { color: #B8860B; }
.platinum-tier { border-left-color: var(--accent-cyan); background: linear-gradient(90deg, rgba(0,242,254,0.1) 0%, transparent 100%); box-shadow: 0 0 10px rgba(0,242,254,0.1); }
.platinum-tier strong { color: var(--accent-cyan); text-shadow: 0 0 8px rgba(0,242,254,0.4); }
</style>