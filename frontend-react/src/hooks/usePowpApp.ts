import { useEffect } from 'react';

/**
 * Hook that encapsulates the former `PowpApp` class logic (sidebar hover,
 * global event listeners, active menu highlighting, etc.).
 *
 * Call this hook once at the root of the application (e.g. in App.tsx).
 */
export function usePowpApp() {
  useEffect(() => {
    // TODO: port the functions from js/app.js here. Example:

    const setupSidebar = () => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;
      // ... copy the event listener logic from app.js but ideally convert to
      // React state/hooks if possible
    };

    const highlightActiveMenuItem = () => {
      // similar to old implementation, you can use window.location.pathname
    };

    setupSidebar();
    highlightActiveMenuItem();

    // global listeners, cleanup in return
    const clickHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('close-modal')) {
        const modal = target.closest('.modal') as HTMLElement | null;
        if (modal) {
          modal.classList.remove('show');
        }
      }
    };

    document.addEventListener('click', clickHandler);

    return () => {
      document.removeEventListener('click', clickHandler);
    };
  }, []);
}
