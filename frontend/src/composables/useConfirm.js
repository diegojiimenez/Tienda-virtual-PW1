import { ref } from 'vue';

const isOpen = ref(false);
const title = ref('');
const message = ref('');
const confirmText = ref('Confirm');
const cancelText = ref('Cancel');
const type = ref('danger');
const resolvePromise = ref(null);
const rejectPromise = ref(null);

export function useConfirm() {
  const confirm = ({
    title: t = 'Are you sure?',
    message: m = 'This action cannot be undone.',
    confirmText: ct = 'Confirm',
    cancelText: clt = 'Cancel',
    type: tp = 'danger'
  } = {}) => {
    title.value = t;
    message.value = m;
    confirmText.value = ct;
    cancelText.value = clt;
    type.value = tp;
    isOpen.value = true;

    return new Promise((resolve, reject) => {
      resolvePromise.value = resolve;
      rejectPromise.value = reject;
    });
  };

  const handleConfirm = () => {
    if (resolvePromise.value) {
      resolvePromise.value(true);
    }
    isOpen.value = false;
  };

  const handleCancel = () => {
    if (rejectPromise.value) {
      rejectPromise.value(false);
    }
    isOpen.value = false;
  };

  const handleClose = () => {
    isOpen.value = false;
  };

  return {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    type,
    confirm,
    handleConfirm,
    handleCancel,
    handleClose
  };
}