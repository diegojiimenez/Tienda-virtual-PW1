<template>
  <div class="min-h-screen bg-white flex">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🛍️</span>
            <span class="text-xl font-bold text-gray-900">FashionDiego</span>
          </div>
          
          <div class="hidden md:flex items-center space-x-8">
            <!-- <router-link to="/shop" class="text-gray-600 hover:text-gray-900">Shop</router-link>
            <router-link to="/new-arrivals" class="text-gray-600 hover:text-gray-900">New Arrivals</router-link>
            <router-link to="/sale" class="text-gray-600 hover:text-gray-900">Sale</router-link> -->
            <router-link to="/signup" class="text-gray-600 hover:text-gray-900">Sign Up</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <div class="flex-1 flex items-center justify-center px-4 pt-20">
      <div class="w-full max-w-md">
        <!-- Título -->
        <h1 class="text-4xl font-bold text-gray-900 text-center mb-8">
          Welcome back
        </h1>

        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              class="input-field"
              :class="{ 'ring-2 ring-red-500': errors.email }"
              required
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="input-field pr-10"
                :class="{ 'ring-2 ring-red-500': errors.password }"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Forgot password - COMENTADO PARA IMPLEMENTAR DESPUÉS -->
          <!-- <div class="text-left">
            <router-link to="/forgot-password" class="text-sm text-gray-500 hover:text-gray-700">
              Forgot password?
            </router-link>
          </div> -->

          <!-- Error general -->
          <div v-if="localError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ localError }}</p>
          </div>

          <!-- Botón Log in -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-primary"
          >
            <span v-if="!authStore.loading">Log in</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          </button>

          <!-- SOCIAL LOGIN - COMENTADO PARA IMPLEMENTAR DESPUÉS -->
          <!-- Divider -->
          <!-- <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div> -->

          <!-- Social buttons -->
          <!-- <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="handleSocialLogin('facebook')"
              class="btn-social flex items-center justify-center space-x-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
            
            <button
              type="button"
              @click="handleSocialLogin('google')"
              class="btn-social flex items-center justify-center space-x-2"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
          </div> -->
        </form>

        <!-- Sign up link -->
        <p class="mt-8 text-center text-sm text-gray-600">
          Don't have an account?
          <router-link to="/signup" class="font-medium text-primary hover:text-blue-600">
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();

const showPassword = ref(false);

// SOLO usar localError para mostrar errores
const localError = ref('');

const form = reactive({
  email: '',
  password: ''
});

const errors = reactive({
  email: '',
  password: ''
});

// Limpiar errores al montar el componente
onMounted(() => {
  authStore.error = null;
  localError.value = '';
});

const validateForm = () => {
  errors.email = '';
  errors.password = '';
  
  if (!form.email) {
    errors.email = 'Email is required';
    return false;
  }
  
  if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid';
    return false;
  }
  
  if (!form.password) {
    errors.password = 'Password is required';
    return false;
  }
  
  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    return false;
  }
  
  return true;
};

const handleLogin = async (event) => {
  // EVITAR que el formulario se envíe por defecto
  event.preventDefault();
  
  if (!validateForm()) return;
  
  // Limpiar error anterior
  localError.value = '';
  authStore.error = null;
  
  try {
    // Usar las credenciales reales de la base de datos
    const success = await authStore.login(form.email, form.password);
    
    if (success) {
      // Login exitoso, redirigir
      router.push('/shop');
    } else {
      // Login falló - FORZAR mostrar el error
      localError.value = 'Invalid email or password';
    }
  } catch (error) {
    console.error('Login error:', error);
    localError.value = 'Invalid email or password';
  }
};

// const handleSocialLogin = (provider) => {
//   // Implementacion Pendiente
//   alert(`Login con ${provider} - Funcionalidad pendiente`);
// };
</script>