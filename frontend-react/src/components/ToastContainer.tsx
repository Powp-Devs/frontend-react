import React, { useEffect, useState } from "react";
import type { Toast, ToastType } from "@/hooks/useToast";

// -------------------------------------------------------
// Ícones inline — sem dependência externa
// -------------------------------------------------------
const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// -------------------------------------------------------
// Estilos — CSS-in-JS para não depender de arquivo externo.
// Usa as variáveis do global.css quando disponíveis.
// -------------------------------------------------------
const styles = `
  @keyframes toast-slide-in {
    from { opacity: 0; transform: translateX(110%); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes toast-slide-out {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(110%); }
  }

  @keyframes toast-progress {
    from { width: 100%; }
    to   { width: 0%; }
  }

  .toast-container {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 9999;
    pointer-events: none;
  }

  .toast-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-width: 320px;
    max-width: 420px;
    padding: 1rem 1rem 0 1rem;
    border-radius: 0.625rem;
    background: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    border-left: 4px solid transparent;
    pointer-events: all;
    position: relative;
    overflow: hidden;
    animation: toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .toast-item.leaving {
    animation: toast-slide-out 0.25s ease-in both;
  }

  .toast-item.success { border-left-color: #1B5E20; }
  .toast-item.error   { border-left-color: #DC2626; }
  .toast-item.warning { border-left-color: #D97706; }
  .toast-item.info    { border-left-color: #2563EB; }

  .toast-icon {
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .toast-icon.success { color: #1B5E20; }
  .toast-icon.error   { color: #DC2626; }
  .toast-icon.warning { color: #D97706; }
  .toast-icon.info    { color: #2563EB; }

  .toast-body {
    flex: 1;
    padding-bottom: 0.875rem;
  }

  .toast-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #111827;
    line-height: 1.3;
    margin-bottom: 0.125rem;
  }

  .toast-message {
    font-size: 0.8125rem;
    color: #6B7280;
    line-height: 1.45;
  }

  .toast-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #9CA3AF;
    padding: 0;
    line-height: 1;
    flex-shrink: 0;
    transition: color 0.15s ease;
  }

  .toast-close:hover { color: #374151; }

  .toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    border-radius: 0 0 0 0.625rem;
    animation: toast-progress linear both;
  }

  .toast-progress.success { background: #1B5E20; }
  .toast-progress.error   { background: #DC2626; }
  .toast-progress.warning { background: #D97706; }
  .toast-progress.info    { background: #2563EB; }

  @media (max-width: 480px) {
    .toast-container {
      left: 1rem;
      right: 1rem;
      top: 1rem;
    }
    .toast-item {
      min-width: unset;
      max-width: unset;
      width: 100%;
    }
  }
`;

// -------------------------------------------------------
// ToastItem — controla a animação de saída localmente
// -------------------------------------------------------
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [leaving, setLeaving] = useState(false);
  const duration = toast.duration ?? 4000;

  const handleClose = () => {
    setLeaving(true);
    // Aguarda a animação de saída antes de remover do estado
    setTimeout(() => onRemove(toast.id), 240);
  };

  // Dispara saída animada quando o auto-remove se aproxima
  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), duration - 300);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className={`toast-item ${toast.type} ${leaving ? "leaving" : ""}`}
      role="alert" aria-live="polite">

      <span className={`toast-icon ${toast.type}`}>
        {icons[toast.type]}
      </span>

      <div className="toast-body">
        <p className="toast-title">{toast.title}</p>
        {toast.message && (
          <p className="toast-message">{toast.message}</p>
        )}
      </div>

      <button className="toast-close" onClick={handleClose}
        aria-label="Fechar notificação">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Barra de progresso animada com a mesma duração do toast */}
      <div
        className={`toast-progress ${toast.type}`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
};

// -------------------------------------------------------
// ToastContainer — renderizado uma vez no AppShell ou main
// -------------------------------------------------------
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <>
      {/* Injeta os estilos uma única vez */}
      <style>{styles}</style>

      <div className="toast-container" aria-label="Notificações">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
};
