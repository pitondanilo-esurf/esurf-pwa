<template>
  <section class="f-block-card hover-lift" @click="goToNotifications">
    
    <div class="f-block-icon">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <div class="f-notification-dot"></div>
    </div>
    
    <div class="f-block-info">
      <h3 class="f-block-title">{{ $t('blocks.features.notifications.title') }}</h3>
      <p class="f-block-desc">
        {{ $t('blocks.features.notifications.description') }}
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
import { useI18n } from 'vue-i18n'; 

const router = useRouter();
const { t } = useI18n(); 

const goToNotifications = () => {
  router.push('/guide/notifiche?back=/guides'); 
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
  background: rgba(59, 130, 246, 0.1); /* Blu traslucido */
  color: var(--accent-blue);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Pallino rosso di notifica finto per dare l'idea di "attivo" */
.f-notification-dot {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 8px;
  height: 8px;
  background-color: #ef4444; /* Rosso */
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  transition: border-color 0.3s ease;
}

.f-block-card:hover .f-notification-dot {
  border-color: var(--bg-card-alt, var(--bg-card));
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  .f-notification-dot {
    top: 8px;
    right: 10px;
    width: 6px;
    height: 6px;
  }
  .f-block-title {
    font-size: 0.95rem;
  }
  .f-block-desc {
    font-size: 0.8rem;
  }
}
</style>