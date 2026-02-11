import { createRouter, createWebHistory } from 'vue-router'

// Import delle Viste
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import LoginView from '../views/auth/LoginView.vue'
import DashboardView from '../views/DashboardView.vue' 
import PodsView from '../views/PodsView.vue'

// [NUOVO] Import Dashboard Admin
import AdminDashboard from '../views/admin/AdminDashboard.vue'

// [NUOVO] Import Setup Owner (Magic Link)
import OwnerSetupView from '../views/auth/OwnerSetupView.vue'

// [NUOVO] Import Dashboard Owner
import OwnerDashboard from '../views/owner/OwnerDashboard.vue'
import OwnerPodsView from '../views/owner/OwnerPodsView.vue'

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
      path: '/pods',          
      name: 'pods',
      component: PodsView     
    },
    
    // [NUOVO] Rotta Admin
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard
    },

    // [NUOVO] Rotta Setup Owner (Atterraggio dal link email)
    {
      path: '/owner/setup',
      name: 'owner-setup',
      component: OwnerSetupView
    },

    // [NUOVO] Rotta Dashboard Owner
    {
      path: '/owner/dashboard',
      name: 'owner-dashboard',
      component: OwnerDashboard
    },
    {
      path: '/owner/pods',
      name: 'owner-pods',
      component: OwnerPodsView // Questo file ora usa PodBulkLoader
    }
  ]
})

export default router