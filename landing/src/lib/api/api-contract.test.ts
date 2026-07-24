import { beforeEach, describe, expect, it } from "vitest";
import { login, getCurrentSession, logout } from "@/lib/api/authApi";
import { createBooking, listForTrainer, slotConflicts, updateBookingStatus } from "@/lib/api/bookingsApi";
import { createDemoCheckoutOrder, listOrdersForCustomer } from "@/lib/api/ordersApi";
import { getSessionsLeftForClient } from "@/lib/api/bookingsApi";
import { submitContact, submitIssue, subscribeNewsletter } from "@/lib/api/contactApi";
import { DEMO_TRAINER_EMAIL, setAllowanceForMonth } from "@/lib/api/sessionCreditsApi";
import { trainerApi } from "@/lib/api/trainerApi";

describe("landing mock API contract", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps auth sessions role-aware", () => {
    const member = login({ email: "member@example.com", password: "demo-pass", role: "client" });
    expect(member.user.role).toBe("client");
    expect(getCurrentSession()?.user.email).toBe("member@example.com");

    const trainer = login({ email: DEMO_TRAINER_EMAIL, password: "demo-pass", role: "trainer" });
    expect(trainer.user.role).toBe("trainer");
    expect(getCurrentSession()?.user.role).toBe("trainer");

    logout();
    expect(getCurrentSession()).toBeNull();
  });

  it("enforces booking conflicts and releases cancelled slots", () => {
    const start = "2026-06-01T14:00:00.000Z";
    const end = "2026-06-01T15:00:00.000Z";

    createBooking({
      clientEmail: "member@example.com",
      trainerEmail: DEMO_TRAINER_EMAIL,
      startISO: start,
      endISO: end,
      title: "Training session",
      status: "pending",
    });

    expect(slotConflicts(start, end, DEMO_TRAINER_EMAIL)).toBe(true);
    const [booking] = listForTrainer(DEMO_TRAINER_EMAIL);
    updateBookingStatus(booking.id, "cancelled");
    expect(slotConflicts(start, end, DEMO_TRAINER_EMAIL)).toBe(false);
  });

  it("creates paid demo orders and grants package credits through checkout boundary", () => {
    const order = createDemoCheckoutOrder({
      customerEmail: "member@example.com",
      customerName: "Member Example",
      paymentProvider: "stripe",
      lines: [{ productId: "pkg-monthly-sessions", qty: 1 }],
    });

    expect(order.status).toBe("paid");
    expect(order.sessionCreditsGranted).toBe(8);
    expect(listOrdersForCustomer("member@example.com")).toHaveLength(1);
    expect(getSessionsLeftForClient("member@example.com")).toBe(8);
  });

  it("stores contact, issue, and newsletter submissions with backend-ready shapes", () => {
    const contact = submitContact({
      name: "Alex",
      email: "alex@example.com",
      message: "I want training details.",
    });
    const issue = submitIssue({
      email: "alex@example.com",
      category: "app",
      details: "The app did not open.",
    });
    const newsletter = subscribeNewsletter("alex@example.com");

    expect(contact.type).toBe("contact");
    expect(issue.type).toBe("issue");
    expect(newsletter.email).toBe("alex@example.com");
  });
});
