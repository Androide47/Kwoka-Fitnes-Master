import { readJson, writeJson } from "@/lib/api/storage";

const KEY = "kwoka_member_progress";

export type ProgressEntryType = "photo" | "measurement" | "note";

export type ProgressMeasurements = {
  weightLb?: number;
  bodyFat?: number;
  chestIn?: number;
  waistIn?: number;
  hipsIn?: number;
  armsIn?: number;
  thighsIn?: number;
};

export type ProgressEntry = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  type: ProgressEntryType;
  notes?: string;
  /** Demo placeholder URLs / captions for photos */
  photos?: string[];
  measurements?: ProgressMeasurements;
  createdAt: string;
};

function seed(): ProgressEntry[] {
  const today = new Date();
  const iso = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };
  return [
    {
      id: "prog-1",
      date: iso(14),
      type: "measurement",
      measurements: { weightLb: 178, waistIn: 34, chestIn: 40 },
      notes: "Baseline check-in",
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: "prog-2",
      date: iso(7),
      type: "note",
      notes: "Felt stronger on squats this week. Sleep was solid.",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "prog-3",
      date: iso(3),
      type: "photo",
      photos: ["Front progress photo (demo)"],
      notes: "Lighting was better than last time.",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];
}

function readEntries(): ProgressEntry[] {
  const stored = readJson<ProgressEntry[] | null>(KEY, null);
  if (stored && stored.length > 0) return stored;
  const seeded = seed();
  writeJson(KEY, seeded);
  return seeded;
}

function writeEntries(entries: ProgressEntry[]) {
  writeJson(KEY, entries);
}

export const memberProgressApi = {
  list(filter?: ProgressEntryType | "all"): ProgressEntry[] {
    const all = readEntries().sort((a, b) => b.date.localeCompare(a.date));
    if (!filter || filter === "all") return all;
    return all.filter((e) => e.type === filter);
  },

  getById(id: string): ProgressEntry | null {
    return readEntries().find((e) => e.id === id) ?? null;
  },

  latestMeasurement(): ProgressEntry | null {
    return this.list("measurement")[0] ?? null;
  },

  add(input: {
    type: ProgressEntryType;
    date?: string;
    notes?: string;
    photos?: string[];
    measurements?: ProgressMeasurements;
  }): ProgressEntry {
    const entry: ProgressEntry = {
      id: `prog-${Date.now()}`,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      type: input.type,
      notes: input.notes?.trim() || undefined,
      photos: input.photos,
      measurements: input.measurements,
      createdAt: new Date().toISOString(),
    };
    writeEntries([entry, ...readEntries()]);
    return entry;
  },

  remove(id: string) {
    writeEntries(readEntries().filter((e) => e.id !== id));
  },
};
