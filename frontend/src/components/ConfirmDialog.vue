<template>
  <!-- Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
      @click.self="cancel"
    >
      <!-- Modal -->
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          <!-- Icon -->
          <div class="flex items-center justify-center mb-4">
            <div 
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :class="iconBgClass"
            >
              <component :is="iconComponent" class="w-6 h-6" :class="iconColorClass" />
            </div>
          </div>

          <!-- Title -->
          <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
            {{ title }}
          </h3>

          <!-- Message -->
          <p class="text-gray-600 text-center mb-6">
            {{ message }}
          </p>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="cancel"
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="confirm"
              class="flex-1 px-4 py-3 font-semibold rounded-lg transition-colors"
              :class="confirmButtonClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { 
  TrashIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Are you sure?'
  },
  message: {
    type: String,
    default: 'This action cannot be undone.'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
    type: String,
    default: 'danger', // danger, warning, info, success
    validator: (value) => ['danger', 'warning', 'info', 'success'].includes(value)
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const iconComponent = computed(() => {
  const icons = {
    danger: TrashIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    success: CheckCircleIcon
  };
  return icons[props.type];
});

const iconBgClass = computed(() => {
  const classes = {
    danger: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100',
    success: 'bg-green-100'
  };
  return classes[props.type];
});

const iconColorClass = computed(() => {
  const classes = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    success: 'text-green-600'
  };
  return classes[props.type];
});

const confirmButtonClass = computed(() => {
  const classes = {
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    info: 'bg-blue-600 text-white hover:bg-blue-700',
    success: 'bg-green-600 text-white hover:bg-green-700'
  };
  return classes[props.type];
});

const confirm = () => {
  emit('confirm');
  emit('close');
};

const cancel = () => {
  emit('cancel');
  emit('close');
};
</script>