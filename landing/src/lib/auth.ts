const MEMBER_KEY = "kwoka_member_session";
const TRAINER_KEY = "kwoka_trainer_session";

export function setMemberSession(email: string) {
  localStorage.setItem(MEMBER_KEY, JSON.stringify({ email, at: Date.now() }));
}

export function getMemberSession(): { email: string } | null {
  try {
    const raw = localStorage.getItem(MEMBER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { email: string };
    return data?.email ? data : null;
  } catch {
    return null;
  }
}

export function clearMemberSession() {
  localStorage.removeItem(MEMBER_KEY);
}

export function setTrainerSession(email: string) {
  localStorage.setItem(TRAINER_KEY, JSON.stringify({ email, at: Date.now() }));
}

export function getTrainerSession(): { email: string } | null {
  try {
    const raw = localStorage.getItem(TRAINER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { email: string };
    return data?.email ? data : null;
  } catch {
    return null;
  }
}

export function clearTrainerSession() {
  localStorage.removeItem(TRAINER_KEY);
}
