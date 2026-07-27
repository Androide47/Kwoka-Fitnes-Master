import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';

/** Hosted path prefix for GitHub Pages (e.g. "/Kwoka-Fitnes-Master/app"). */
export function getWebBaseUrl(): string {
  const fromConfig = Constants.expoConfig?.experiments?.baseUrl;
  if (typeof fromConfig === 'string' && fromConfig.length > 0) {
    return fromConfig.replace(/\/$/, '');
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const match = window.location.pathname.match(/^(\/[^/]+\/app)(?=\/|$)/);
    if (match) return match[1];
  }

  return '';
}

function hrefToPath(href: Href | string): string {
  if (typeof href === 'string') return href;
  if (href && typeof href === 'object' && 'pathname' in href && href.pathname) {
    return href.pathname;
  }
  return '/';
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/$/, '') || '/';
}

function webTargetPath(hrefPath: string): string {
  const base = getWebBaseUrl();
  const normalized = hrefPath === '/' ? '/' : hrefPath;
  return normalizePathname(`${base}${normalized}`);
}

function alreadyOnWebPath(hrefPath: string): boolean {
  if (typeof window === 'undefined') return false;
  return normalizePathname(window.location.pathname) === webTargetPath(hrefPath);
}

/**
 * Navigate without wiping in-memory auth when possible.
 * Full page loads on web re-run Zustand persist from defaults and caused
 * login ↔ tabs redirect loops with the auth guard.
 */
export function appReplace(href: Href | string) {
  const path = hrefToPath(href);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (alreadyOnWebPath(path)) return;

    queueMicrotask(() => {
      try {
        router.replace(href as Href);
      } catch {
        const base = getWebBaseUrl();
        const normalized = path === '/' ? '/' : path;
        window.location.replace(`${base}${normalized}`);
      }
    });
    return;
  }

  queueMicrotask(() => {
    router.replace(href as Href);
  });
}

export function appPush(href: Href | string) {
  const path = hrefToPath(href);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (alreadyOnWebPath(path)) return;

    queueMicrotask(() => {
      try {
        router.push(href as Href);
      } catch {
        const base = getWebBaseUrl();
        const normalized = path === '/' ? '/' : path;
        window.location.assign(`${base}${normalized}`);
      }
    });
    return;
  }

  queueMicrotask(() => {
    router.push(href as Href);
  });
}
