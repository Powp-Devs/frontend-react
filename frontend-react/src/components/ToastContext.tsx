import React, { createContext, useContext } from "react";
import { useToast} from "@/hooks/useToast";
import { ToastContainer } from "@/components/ToastContainer";

type ToastContextType = ReturnType<typeof useToast>;
const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext deve ser usado dentro de ToastProvider");
  return ctx;
}