import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import SignUpView from '@/views/SignUpView.vue'
import ShopView from '@/views/ShopView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import AdminView from '@/views/AdminView.vue'
import ChatView from '@/views/ChatView.vue'
import AdminChatView from '@/views/AdminChatView.vue'

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
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/chat',
      name: 'admin-chat',
      component: AdminChatView,
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

// 👇 CAMBIAR EL ROUTER GUARD PARA ESPERAR INICIALIZACIÓN
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 👈 ESPERAR A QUE SE INICIALICE LA AUTENTICACIÓN
  await authStore.initializeAuth()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/shop')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/shop')
  } else {
    next()
  }
})

export default router