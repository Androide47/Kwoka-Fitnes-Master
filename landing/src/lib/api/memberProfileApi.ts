import { readJson, removeJson, writeJson } from "@/lib/api/storage";
import type { MemberProfile } from "@/lib/api/types";

const PROFILE_KEY = "kwoka_member_profile";

export const GOAL_OPTIONS = [
  "Lose weight",
  "Build muscle",
  "Improve endurance",
  "Increase flexibility",
  "General fitness",
  "Sport performance",
] as const;

export const HABIT_OPTIONS = [
  "Regular exercise",
  "Track nutrition",
  "Drink enough water",
  "Prioritize sleep",
  "Manage stress",
  "Limit alcohol",
  "Walk daily",
  "Stretch / mobility",
] as const;

function emptyProfile(userId: string, email: string): MemberProfile {
  return {
    userId,
    email,
    phone: "",
    birthday: "",
    unitSystem: "imperial",
    heightIn: "",
    weightLb: "",
    fitnessLevel: "",
    goals: [],
    habits: [],
    medicalConditions: "",
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export const memberProfileApi = {
  get(): MemberProfile | null {
    const profile = readJson<MemberProfile | null>(PROFILE_KEY, null);
    if (!profile) return null;
    return {
      ...profile,
      unitSystem: profile.unitSystem === "metric" ? "metric" : "imperial",
    };
  },

  getForUser(userId: string, email: string): MemberProfile {
    const existing = this.get();
    if (existing && existing.userId === userId) {
      return existing;
    }
    return emptyProfile(userId, email);
  },

  isCompleteFor(userId: string): boolean {
    const profile = this.get();
    return Boolean(profile && profile.userId === userId && profile.completedAt);
  },

  isComplete(profile: MemberProfile | null = this.get()): boolean {
    return Boolean(profile?.completedAt);
  },

  startForUser(userId: string, email: string): MemberProfile {
    const profile = emptyProfile(userId, email);
    writeJson(PROFILE_KEY, profile);
    return profile;
  },

  save(profile: MemberProfile): MemberProfile {
    const next: MemberProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    writeJson(PROFILE_KEY, next);
    return next;
  },

  complete(profile: MemberProfile): MemberProfile {
    return this.save({
      ...profile,
      completedAt: new Date().toISOString(),
    });
  },

  clear() {
    removeJson(PROFILE_KEY);
  },
};
