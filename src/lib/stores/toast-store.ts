import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
};

const toastStore = writable<Toast[]>([]);

export const toasts = { subscribe: toastStore.subscribe };

let toastCounter = 0;

export function addToast(message: string, type: ToastType = 'info', duration = 3500): void {
  const id = `toast-${++toastCounter}`;
  toastStore.update((ts) => [...ts, { id, message, type, duration }]);
  setTimeout(() => removeToast(id), duration);
}

export function removeToast(id: string): void {
  toastStore.update((ts) => ts.filter((t) => t.id !== id));
}
