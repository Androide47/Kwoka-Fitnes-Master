import { config } from "./config";
import { seedDb } from "./seed";
import type { AdminDb } from "./types";

const KEY = "kwoka-admin-db-v1";

export function loadDb(): AdminDb {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminDb;
      return {
        ...seedDb(),
        ...parsed,
        aws: { ...seedDb().aws, ...parsed.aws, usingMocks: config.useMocks },
      };
    }
  } catch {
    /* ignore corrupt cache */
  }
  const fresh = seedDb();
  fresh.aws.usingMocks = config.useMocks;
  return fresh;
}

export function saveDb(db: AdminDb): void {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function resetDb(): AdminDb {
  const fresh = seedDb();
  fresh.aws.usingMocks = config.useMocks;
  saveDb(fresh);
  return fresh;
}
