"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeToToasts, type ToastEvent, type ToastPayload } from "@/utils/toast";
import { cn } from "@/utils/clsx";
import type { CSSProperties } from "react";

const DEFAULT_DURATION = 4000;

const glassBase: CSSProperties = {
  borderColor: "rgba(255,255,255,0.18)",
  boxShadow: "0 25px 60px rgba(15,23,42,0.45)",
  backdropFilter: "blur(18px) saturate(150%)",
  WebkitBackdropFilter: "blur(18px) saturate(150%)",
};

const variantStyles: Record<string, { className: string; style: CSSProperties }> = {
  default: {
    className: "text-white",
    style: {
      ...glassBase,
      background: "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.65))",
    },
  },
  info: {
    className: "text-white",
    style: {
      ...glassBase,
      background: "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(14,165,233,0.6))",
      borderColor: "rgba(125,211,252,0.45)",
    },
  },
  success: {
    className: "text-white",
    style: {
      ...glassBase,
      background: "linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.65))",
      borderColor: "rgba(167,243,208,0.45)",
    },
  },
  warning: {
    className: "text-white",
    style: {
      ...glassBase,
      background: "linear-gradient(135deg, rgba(249,115,22,0.92), rgba(249,115,22,0.6))",
      borderColor: "rgba(254,215,170,0.5)",
    },
  },
  error: {
    className: "text-white",
    style: {
      ...glassBase,
      background: "linear-gradient(135deg, rgba(239,68,68,0.92), rgba(185,28,28,0.6))",
      borderColor: "rgba(254,202,202,0.5)",
    },
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const timers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const element = document.createElement("div");
    element.setAttribute("data-toast-root", "true");
    document.body.appendChild(element);
    setContainer(element);
    return () => {
      element.remove();
      setContainer(null);
    };
  }, []);

  const clearTimer = useCallback((toastId: string) => {
    const timeoutId = timers.current.get(toastId);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timers.current.delete(toastId);
    }
  }, []);

  const removeToast = useCallback(
    (toastId: string) => {
      clearTimer(toastId);
      setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
    },
    [clearTimer],
  );

  const scheduleDismiss = useCallback(
    (toast: ToastPayload) => {
      clearTimer(toast.id);
      if (toast.isLoading) {
        return;
      }
      const duration = toast.duration ?? DEFAULT_DURATION;
      if (duration <= 0) {
        return;
      }
      const timeout = window.setTimeout(() => {
        removeToast(toast.id);
      }, duration);
      timers.current.set(toast.id, timeout);
    },
    [clearTimer, removeToast],
  );

  const addToastToState = useCallback(
    (toast: ToastPayload) => {
      const duplicatesToClear: string[] = [];
      setToasts((prev) => {
        const filtered =
          toast.intent === "error"
            ? prev.filter((existing) => {
                const isDuplicate =
                  existing.intent === "error" &&
                  existing.message === toast.message &&
                  existing.description === toast.description &&
                  !existing.isLoading &&
                  !toast.isLoading;
                if (isDuplicate) {
                  duplicatesToClear.push(existing.id);
                }
                return !isDuplicate;
              })
            : prev;
        return [...filtered, toast];
      });
      duplicatesToClear.forEach((id) => clearTimer(id));
      scheduleDismiss(toast);
    },
    [clearTimer, scheduleDismiss],
  );

  useEffect(() => {
    const timersMap = timers.current;
    const handleEvent = (event: ToastEvent) => {
      if (event.type === "add") {
        addToastToState(event.toast);
        return;
      }
      if (event.type === "update") {
        let updatedToast: ToastPayload | null = null;
        setToasts((prev) =>
          prev.map((toast) => {
            if (toast.id !== event.toastId) return toast;
            updatedToast = { ...toast, ...event.patch };
            return updatedToast;
          }),
        );
        if (updatedToast) {
          scheduleDismiss(updatedToast);
        }
        return;
      }
      if (event.type === "dismiss") {
        removeToast(event.toastId);
      }
    };

    const unsubscribe = subscribeToToasts(handleEvent);
    return () => {
      unsubscribe();
      timersMap.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timersMap.clear();
    };
  }, [addToastToState, removeToast, scheduleDismiss]);

  if (!container || toasts.length === 0) {
    return null;
  }

  const content = (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center gap-4 p-6">
      {toasts.map((toast) => {
        const variant = variantStyles[toast.intent ?? "default"] ?? variantStyles.default;
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto w-full max-w-4xl rounded-2xl border px-8 py-6 text-base shadow-2xl transition-all backdrop-blur-2xl",
              variant.className,
            )}
            style={variant.style}
          >
            <div className="flex items-start gap-4">
              {toast.isLoading ? (
                <span className="mt-1 h-5 w-5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              ) : null}
              <div className="flex-1 space-y-2">
                <p className="text-xl font-semibold leading-snug">{toast.message}</p>
                {toast.description ? <p className="text-base opacity-90">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                aria-label="Cerrar notificación"
                className="text-2xl font-semibold opacity-80 transition hover:opacity-100"
                onClick={() => removeToast(toast.id)}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return createPortal(content, container);
}
