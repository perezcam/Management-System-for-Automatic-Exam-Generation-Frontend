export type ToastIntent = "default" | "info" | "success" | "error" | "warning";

export type ToastPayload = {
  id: string;
  message: string;
  description?: string;
  title?: string;
  intent: ToastIntent;
  duration?: number;
  isLoading?: boolean;
};

export type ToastEvent =
  | { type: "add"; toast: ToastPayload }
  | { type: "update"; toastId: string; patch: Partial<Omit<ToastPayload, "id">> }
  | { type: "dismiss"; toastId: string };

type Listener = (event: ToastEvent) => void;

const listeners = new Set<Listener>();
const pendingQueue: ToastEvent[] = [];

const DEFAULT_SUCCESS_DURATION = 4000;
const DEFAULT_ERROR_DURATION = 5000;

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const emit = (event: ToastEvent) => {
  if (listeners.size === 0) {
    pendingQueue.push(event);
    return;
  }
  listeners.forEach((listener) => listener(event));
};

const addToast = (toast: Omit<ToastPayload, "id" | "intent"> & { id?: string; intent?: ToastIntent }) => {
  const { id, intent, ...rest } = toast;
  const payload: ToastPayload = {
    id: id ?? createId(),
    intent: intent ?? "default",
    ...rest,
  };
  emit({ type: "add", toast: payload });
  return payload.id;
};

export function subscribeToToasts(listener: Listener) {
  listeners.add(listener);
  if (pendingQueue.length > 0) {
    const queued = [...pendingQueue];
    pendingQueue.length = 0;
    queued.forEach((event) => listener(event));
  }
  return () => listeners.delete(listener);
}

export function updateToast(toastId: string, patch: Partial<Omit<ToastPayload, "id">>) {
  emit({ type: "update", toastId, patch });
}

export function dismissToast(toastId: string) {
  emit({ type: "dismiss", toastId });
}

type ToastOptions = {
  duration?: number;
  id?: string;
};

const showToast = (
  intent: ToastIntent,
  message: string,
  description?: string,
  options: ToastOptions = {},
) => {
  return addToast({
    id: options.id,
    intent,
    message,
    description,
    duration: options.duration,
  });
};

export function showSuccess(message: string, description?: string, options?: ToastOptions) {
  return showToast("success", message, description, { duration: DEFAULT_SUCCESS_DURATION, ...options });
}

export function showError(message: string, description?: string, options?: ToastOptions) {
  return showToast("error", message, description, { duration: DEFAULT_ERROR_DURATION, ...options });
}

export function showInfo(message: string, description?: string, options?: ToastOptions) {
  return showToast("info", message, description, { duration: DEFAULT_SUCCESS_DURATION, ...options });
}

export function showWarning(message: string, description?: string, options?: ToastOptions) {
  return showToast("warning", message, description, { duration: DEFAULT_SUCCESS_DURATION, ...options });
}

export function showMessage(message: string, description?: string, options?: ToastOptions) {
  return showToast("default", message, description, options);
}

export function showLoading(message: string, description?: string, options?: ToastOptions) {
  return addToast({
    id: options?.id,
    intent: "info",
    message,
    description,
    duration: options?.duration ?? 0,
    isLoading: true,
  });
}

type ToastPromiseMessages<T> = {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
};

export function showPromise<T>(promise: Promise<T>, messages: ToastPromiseMessages<T>) {
  const toastId = showLoading(messages.loading);
  promise
    .then((data) => {
      const successMessage = typeof messages.success === "function" ? messages.success(data) : messages.success;
      updateToast(toastId, {
        message: successMessage,
        description: undefined,
        intent: "success",
        isLoading: false,
        duration: DEFAULT_SUCCESS_DURATION,
      });
      return data;
    })
    .catch((error) => {
      const errorMessage = typeof messages.error === "function" ? messages.error(error) : messages.error;
      updateToast(toastId, {
        message: errorMessage,
        description: error instanceof Error ? error.message : undefined,
        intent: "error",
        isLoading: false,
        duration: DEFAULT_ERROR_DURATION,
      });
      return error;
    });
  return promise;
}

// Compatibilidad con imports existentes
export const showErrorToast = (message: string, description?: string, options?: ToastOptions) =>
  showError(message, description, options);

export const showSuccessToast = (message: string, description?: string, options?: ToastOptions) =>
  showSuccess(message, description, options);

export const showInfoToast = (message: string, description?: string, options?: ToastOptions) =>
  showInfo(message, description, options);
