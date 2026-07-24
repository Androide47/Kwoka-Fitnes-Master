import { beforeEach, describe, expect, it } from "vitest";
import { clearMemberSession, clearTrainerSession, getMemberSession, getTrainerSession, login } from "@/lib/api/authApi";
import { bookingsApi } from "@/lib/api/bookingsApi";
import { setAllowanceForMonth } from "@/lib/api/sessionCreditsApi";
import { listTrainerClients } from "@/lib/api/trainerApi";

const futureSlot = () => {
  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start);
  end.setHours(11, 0, 0, 0);
  return { start, end };
};

describe("demo security boundaries", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps member and trainer sessions mutually exclusive", () => {
    login({ email: "member@example.com", role: "client" });

    expect(getMemberSession()?.user.role).toBe("client");
    expect(getTrainerSession()).toBeNull();

    login({ email: "coach@example.com", role: "trainer" });

    expect(getMemberSession()).toBeNull();
    expect(getTrainerSession()?.user.role).toBe("trainer");
  });

  it("clears role sessions independently", () => {
    login({ email: "member@example.com", role: "client" });
    clearMemberSession();
    expect(getMemberSession()).toBeNull();

    login({ email: "coach@example.com", role: "trainer" });
    clearTrainerSession();
    expect(getTrainerSession()).toBeNull();
  });

  it("prevents booking when the client has no session credits", () => {
    expect(bookingsApi.canClientCreatePendingBooking("client@example.com")).toBe(false);
  });

  it("requires server-side-style conflict checks for trainer slots", () => {
    const email = "client@example.com";
    const trainerEmail = "coach@kwoka.fit";
    const { start, end } = futureSlot();
    setAllowanceForMonth(email, 2);

    bookingsApi.createBooking({
      clientEmail: email,
      trainerEmail,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      title: "Training session",
      status: "pending",
    });

    expect(bookingsApi.slotConflicts(start.toISOString(), end.toISOString(), trainerEmail)).toBe(true);
  });

  it("does not expose unrelated trainer clients in the demo client lookup", () => {
    expect(listTrainerClients()).toHaveLength(3);
    expect(listTrainerClients().map((client) => client.email)).not.toContain("unrelated@example.com");
  });
});
