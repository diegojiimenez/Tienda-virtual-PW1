import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const SignUpView = () => import('@/views/SignUpView.vue')
const ShopView = () => import('@/views/ShopView.vue')
const ProductDetailView = () => import('@/views/ProductDetailView.vue')
const ChatView = () => import('@/views/ChatView.vue')
const AdminView = () => import('@/views/AdminView.vue')
const AdminChatView = () => import('@/views/AdminChatView.vue')
const CartView = () => import('@/views/CartView.vue')

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
      path: '/cart',
      name: 'cart',
      component: CartView,
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  await authStore.initializeAuth()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/shop')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/shop')
  } else {
    next()
  }
})

export default router
