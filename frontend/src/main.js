import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')

// Inicializar autenticación y carrito después de que la app esté montada
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

router.isReady().then(() => {
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  
})