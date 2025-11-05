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
            <router-link to="/shop" class="text-gray-600 hover:text-gray-900">Shop</router-link>
            <router-link to="/new-arrivals" class="text-gray-600 hover:text-gray-900">New Arrivals</router-link>
            <router-link to="/brands" class="text-gray-600 hover:text-gray-900">Brands</router-link>
            <router-link to="/login" class="text-gray-600 hover:text-gray-900">Sign In</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <div class="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
      <div class="w-full max-w-md">
        <!-- Título -->
        <h1 class="text-4xl font-bold text-gray-900 text-center mb-8">
          Create Account
        </h1>

        <!-- Formulario -->
        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              v-model="form.nombre"
              type="text"
              placeholder="Enter your first name"
              class="input-field"
              :class="{ 'ring-2 ring-red-500': errors.nombre }"
              required
            />
            <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              v-model="form.apellido"
              type="text"
              placeholder="Enter your last name"
              class="input-field"
              :class="{ 'ring-2 ring-red-500': errors.apellido }"
              required
            />
            <p v-if="errors.apellido" class="mt-1 text-sm text-red-600">{{ errors.apellido }}</p>
          </div>

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

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm your password"
                class="input-field pr-10"
                :class="{ 'ring-2 ring-red-500': errors.confirmPassword }"
                required
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5" />
                <EyeSlashIcon v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Error general -->
          <div v-if="authStore.error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ authStore.error }}</p>
          </div>

          <!-- Botón Create Account -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-primary mt-6"
          >
            <span v-if="!authStore.loading">Create Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          </button>
        </form>

        <!-- Sign in link -->
        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <router-link to="/login" class="font-medium text-primary hover:text-blue-600">
            Sign In
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = reactive({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const errors = reactive({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const validateForm = () => {
  // Resetear errores
  errors.nombre = '';
  errors.apellido = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';

  let isValid = true;

  if (!form.nombre || form.nombre.trim().length < 2) {
    errors.nombre = 'First name must be at least 2 characters';
    isValid = false;
  }

  if (!form.apellido || form.apellido.trim().length < 2) {
    errors.apellido = 'Last name must be at least 2 characters';
    isValid = false;
  }

  if (!form.email) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    isValid = false;
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  try {
    await authStore.register({
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      password: form.password
    });

    router.push('/shop');
  } catch (error) {
    console.error('Registration error:', error);
  }
};
</script>