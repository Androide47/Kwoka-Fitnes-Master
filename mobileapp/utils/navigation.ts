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

/**
 * Expo Router client navigation is unreliable under experiments.baseUrl on
 * static GitHub Pages. Use a full page load on web; keep router on native.
 *
 * Prefer <Redirect /> for the initial route on native — calling router.* before
 * Root Layout mounts throws.
 */
export function appReplace(href: Href | string) {
  const path = hrefToPath(href);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const base = getWebBaseUrl();
    const normalized = path === '/' ? '/' : path;
    window.location.replace(`${base}${normalized}`);
    return;
  }

  // Defer so callers in useEffect don't race Root Layout mount.
  queueMicrotask(() => {
    router.replace(href as Href);
  });
}

export function appPush(href: Href | string) {
  const path = hrefToPath(href);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const base = getWebBaseUrl();
    const normalized = path === '/' ? '/' : path;
    window.location.assign(`${base}${normalized}`);
    return;
  }

  queueMicrotask(() => {
    router.push(href as Href);
  });
}
