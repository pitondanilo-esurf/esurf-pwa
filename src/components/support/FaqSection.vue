<template>
  <div class="app-container">
    <TopNavbar />

    <main class="main-content main-content-tight">
      
      <GuideHeader 
        :title="$t('faq.title')" 
        backRoute="/support" 
      />

      <div class="f-faq-container fade-in delay-1">
        <p class="f-section-subtitle">{{ $t('faq.subtitle') }}</p>

        <div class="f-faq-list">
          <div 
            v-for="(item, index) in faqItems" 
            :key="item.id || index" 
            class="f-faq-item"
            :class="{ 'is-open': openIndex === index }"
          >
            <div class="f-faq-header" @click="toggleFaq(index)">
              <h3 class="f-faq-question">{{ item.question }}</h3>
              <div class="f-faq-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
            
            <transition name="faq-slide">
              <div v-show="openIndex === index" class="f-faq-body">
                <p class="f-faq-answer" v-html="item.answer"></p>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </main>

    <BottomNavbar class="fade-in delay-3" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
// Importazione dei componenti di layout
import TopNavbar from '@/components/TopNavbar.vue';
import BottomNavbar from '@/components/BottomNavbar.vue';
import GuideHeader from '@/components/layout/GuideHeader.vue';

// Inizializza i18n
const { tm } = useI18n();
const openIndex = ref(null);

// Recupera l'intero array 'items' dal file di lingua corrente (it.json o en.json)
// computed() farà aggiornare automaticamente la lista se l'utente cambia lingua!
const faqItems = computed(() => {
  const items = tm('faq.items');
  return Array.isArray(items) ? items : [];
});

const toggleFaq = (index) => {
  openIndex.value = openIndex.value === index ? null : index;
};
</script>

<style scoped>
/* LAYOUT BASE */
.app-container { min-height: 100vh; background-color: var(--bg-app); color: var(--text-main); }
.main-content { padding: 1rem 1rem 5rem 1rem; max-width: 800px; margin: 0 auto; padding-bottom: 100px; }

/* FAQ CONTAINER STYLE */
.f-faq-container { 
  margin-top: 0.5rem; 
  background: var(--bg-card); 
  border: 1px solid var(--border-color); 
  border-radius: 16px; 
  padding: 24px; 
}

.f-section-subtitle { 
  margin: 0 0 24px 0; 
  font-size: 0.9rem; 
  color: var(--text-muted); 
}

.f-faq-list { display: flex; flex-direction: column; gap: 12px; }

.f-faq-item { 
  border: 1px solid var(--border-color); 
  border-radius: 12px; 
  background: var(--bg-app); 
  overflow: hidden; 
  transition: border-color 0.2s; 
}

.f-faq-item.is-open { border-color: var(--accent-blue); }

.f-faq-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 16px; 
  cursor: pointer; 
  user-select: none;
}

.f-faq-question { 
  margin: 0; 
  font-size: 0.95rem; 
  font-weight: 700; 
  color: var(--text-main); 
  padding-right: 16px;
}

.f-faq-icon { 
  color: var(--text-muted); 
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  display: flex;
}

.f-faq-item.is-open .f-faq-icon { transform: rotate(180deg); color: var(--accent-blue); }

.f-faq-body { padding: 0 16px 16px 16px; }

.f-faq-item.is-open .f-faq-body { 
  border-top: 1px solid var(--border-color); 
  padding-top: 16px; 
}

.f-faq-answer { margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }

/* ANIMAZIONI */
.faq-slide-enter-active, .faq-slide-leave-active { transition: all 0.3s ease; max-height: 500px; }
.faq-slide-enter-from, .faq-slide-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0;}

.fade-in { animation: fadeIn 0.4s ease forwards; opacity: 0; }
.delay-1 { animation-delay: 0.1s; }
.delay-3 { animation-delay: 0.2s; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>