<template>
  <section class="f-block-card hover-lift" @click="goToGuide">
    
    <div class="f-block-icon">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    </div>
    
    <div class="f-block-info">
      <h3 class="f-block-title">{{ $t('blocks.features.monitoraggioElettrico.title') }}</h3>
      <p class="f-block-desc">
        {{ $t('blocks.features.monitoraggioElettrico.description') }}
      </p>
    </div>
    
    <div class="f-block-action">
      <div class="f-action-circle">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </div>

  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToGuide = () => {
  router.push('/guide/monitoraggio-elettrico?back=/guides'); 
};
</script>

<style scoped>
/* --- FINTECH BLOCK CARD --- */
.f-block-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.f-block-card:hover {
  border-color: var(--accent-blue);
  background: var(--bg-card-alt, var(--bg-card));
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

/* --- ICONA --- */
.f-block-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.1); /* Sfondo blu traslucido */
  color: var(--accent-blue);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- TESTI --- */
.f-block-info {
  flex: 1;
}

.f-block-title {
  margin: 0 0 4px 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

.f-block-desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}

/* --- AZIONE (FRECCIA) --- */
.f-block-action {
  flex-shrink: 0;
  margin-left: 8px;
}

.f-action-circle {
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

.f-block-card:hover .f-action-circle {
  background: var(--text-main);
  color: var(--bg-card);
  border-color: var(--text-main);
}

/* Responsive per schermi molto piccoli */
@media (max-width: 480px) {
  .f-block-card {
    padding: 14px;
    gap: 12px;
  }
  .f-block-icon {
    width: 40px;
    height: 40px;
  }
  .f-block-icon svg {
    width: 20px;
    height: 20px;
  }
  .f-block-title {
    font-size: 0.95rem;
  }
  .f-block-desc {
    font-size: 0.8rem;
  }
}
</style>