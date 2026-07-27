import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Zustand persist starts with defaults (`isAuthenticated: false`) until storage
 * rehydrates. Auth redirects must wait or web hard-nav will loop login ↔ tabs.
 */
export function useAuthHydration() {
  const [hydrated, setHydrated] = useState(() => {
    try {
      return useAuthStore.persist.hasHydrated();
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (useAuthStore.persist.hasHydrated()) {
        setHydrated(true);
        return;
      }
      return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    } catch {
      setHydrated(true);
    }
  }, []);

  return hydrated;
}
