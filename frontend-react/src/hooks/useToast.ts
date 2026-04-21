import { useState, useCallback } from "react";

// -------------------------------------------------------
// Tipos
// -------------------------------------------------------
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms — padrão 4000
}

type ToastInput = Omit<Toast, "id">;

interface UseToastReturn {
  toasts: Toast[];
  showToast: (input: ToastInput) => void;
  removeToast: (id: string) => void;
  // Atalhos semânticos
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

// -------------------------------------------------------
// Hook
// -------------------------------------------------------
export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = input.duration ?? 4000;

      setToasts((prev) => [...prev, { ...input, id }]);

      // Auto-remove após duration
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  // Atalhos — evitam repetição nos componentes
  const success = useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: "warning", title, message }),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  return { toasts, showToast, removeToast, success, error, warning, info };
};
