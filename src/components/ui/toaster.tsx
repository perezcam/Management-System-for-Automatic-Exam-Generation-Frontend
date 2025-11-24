"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { subscribeToToasts, type ToastEvent, type ToastPayload } from "@/utils/toast";

const DEFAULT_DURATION = 4000;

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
    <div className="msfaeg-toaster-root">
      {toasts.map((toast) => {
        const intent = toast.intent ?? "default"; // default | info | success | warning | error
        const variantClass = `msfaeg-toaster-item--${intent}`;

        return (
          <div
            key={toast.id}
            className={`msfaeg-toaster-item ${variantClass}`}
          >
            <div className="msfaeg-toaster-inner">
              {toast.isLoading ? (
                <span className="msfaeg-toaster-spinner" />
              ) : null}

              <div className="msfaeg-toaster-body">
                <p className="msfaeg-toaster-title">{toast.message}</p>
                {toast.description ? (
                  <p className="msfaeg-toaster-description">
                    {toast.description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                aria-label="Cerrar notificación"
                className="msfaeg-toaster-close"
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
