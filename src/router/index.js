import { createRouter, createWebHistory } from 'vue-router'

// Import delle Viste principali
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import LoginView from '../views/auth/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'

// VECCHIA GESTIONE PODS (Mantenuta come richiesto)
import PodsView from '../views/PodsView.vue'

import Home from '../views/Home.vue'
import ProfiloView from '@/views/ProfiloView.vue'
import FiveSteps from '@/views/guide/5Steps.vue'

// Import Dashboard Admin
import AdminDashboard from '../views/admin/AdminDashboard.vue'

// Import Setup Owner (Magic Link)
import OwnerSetupView from '../views/auth/OwnerSetupView.vue'

// Import Dashboard Owner
import OwnerDashboard from '../views/owner/OwnerDashboard.vue'
import OwnerPodsView from '../views/owner/OwnerPodsView.vue'
import OwnerCommunityView from '@/views/owner/OwnerCommunityView.vue';
import OwnerEducationView from '@/views/owner/OwnerEducationView.vue';
import StrategicSurvey from '@/views/survey/StrategicSurvey.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/Home',
      name: 'Home',
      component: Home
    },
    // Rotta Guida Identità Digitale
    {
      path: '/guide/identita-digitale',
      name: 'identita-digitale',
      component: () => import('../views/guide/IdentitaDigitale.vue')
    },

    // --- VECCHIA ROTTA PODS (MANTENUTA ATTIVA) ---
    {
      path: '/pods',
      name: 'pods',
      component: PodsView
    },

    // Rotta Admin
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard
    },

    // Rotta Setup Owner (Atterraggio dal link email)
    {
      path: '/owner/setup',
      name: 'owner-setup',
      component: OwnerSetupView
    },

    // Rotte Dashboard Owner
    {
      path: '/owner/dashboard',
      name: 'owner-dashboard',
      component: OwnerDashboard
    },
    {
      path: '/owner/pods',
      name: 'owner-pods',
      component: OwnerPodsView
    },
    {
      path: '/owner/cabine',
      name: 'OwnerCabine',
      component: OwnerCommunityView,
      meta: { requiresAuth: true }
    },
    {
      path: '/owner/education',
      name: 'OwnerEducation',
      component: OwnerEducationView,
      meta: { requiresAuth: true, role: 'owner' }
    },
    {
      path: '/owner/bollette',
      name: 'OwnerCommunityBills',
      component: () => import('@/views/owner/CommunityBillsViewer.vue'),
      meta: { requiresAuth: true }
    },

    // Altre rotte
    {
      path: '/profilo',
      name: 'Profilo',
      component: ProfiloView,
      meta: { requiresAuth: true }
    },
    {
      path: '/guide/5-steps',
      name: 'FiveSteps',
      component: FiveSteps
    },
    {
      path: '/guide/monitoraggio-elettrico',
      component: () => import('@/views/guide/MonitoraggioElettrico.vue')
    },
    {
      path: '/guide/notifiche',
      name: 'notifiche-guida',
      component: () => import('../views/guide/Notifiche.vue')
    },
    {
      path: '/guide/mercato',
      name: 'mercato-guida',
      component: () => import('../views/guide/MarketGuide.vue')
    },
    {
      path: '/survey/:schemaName',
      name: 'StrategicSurvey',
      component: () => import('@/views/survey/StrategicSurvey.vue'),
      meta: { requiresAuth: true }
    },

    // --- NUOVE ROTTE RISORSE E ONBOARDING ---
    {
      path: '/onboarding-risorse',
      name: 'ResourceOnboarding',
      component: () => import('@/views/ResourceOnboarding.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/resources',
      name: 'Resources',
      component: () => import('@/views/ResourceView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Gestione Risorse'
      }
    },
    {
      path: '/control-tower',
      name: 'control-tower',
      component: () => import('@/views/ControlTowerView.vue')
    },
    {
      path: '/triage',
      name: 'triage',
      component: () => import('@/views/TriageView.vue')
    },
    { path: '/swipe', name: 'swipe', component: () => import('@/views/SwipeableView.vue') },
    {
      path: '/admin/aste-flessibilita',
      name: 'admin-flex-auctions',
      component: () => import('@/views/admin/SuperAdminFlexAuctionView.vue'),
    }
  ]
});

// Gestione dello scroll dopo ogni cambio pagina
router.afterEach((to, from) => {
  setTimeout(() => {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.scrollTo({ top: 0, behavior: 'instant' });
    }

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

  }, 10);

  // Aggiorna il titolo del tab del browser
  if (to.meta.title) {
    document.title = `${to.meta.title} - eSurf`;
  } else {
    document.title = 'eSurf';
  }
});

export default router