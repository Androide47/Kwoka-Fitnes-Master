import type { Href } from 'expo-router';
import type { Client, User } from '@/types';

export function isClientProfileComplete(user: User | null | undefined): boolean {
  if (!user || user.role !== 'client') return true;
  const client = user as Client;
  if (client.profileComplete === false) return false;
  if (client.profileComplete === true) return true;
  return client.height > 0 && client.weight > 0 && (client.goals?.length ?? 0) > 0;
}

export function afterAuthHref(user: User | null | undefined): Href {
  if (!isClientProfileComplete(user)) return '/profile-setup';
  return '/(tabs)';
}
