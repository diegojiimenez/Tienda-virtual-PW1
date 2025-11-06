import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ShopView from '@/views/ShopView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import AdminView from '@/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
      meta: { requiresGuest: true }
    },
    {
      path: '/shop',
      name: 'shop',
      component: ShopView,
      meta: { requiresAuth: true }
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/logout',
      name: 'logout',
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        authStore.logout()
        next('/login')
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Inicializar auth si no está cargado
  if (!authStore.user && !authStore.token) {
    authStore.initializeAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Si requiere autenticación y no está autenticado, ir a login
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Si requiere admin y no es admin, ir a shop
    next('/shop')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Si es una ruta de invitado (login/signup) y ya está autenticado
    // SIEMPRE ir a /shop, sin importar si es admin o no
    next('/shop')
  } else {
    // En cualquier otro caso, permitir la navegación
    next()
  }
})

export default router