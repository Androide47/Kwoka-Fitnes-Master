import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { getMemberSession } from "@/lib/auth";
import { DEMO_TRAINER_EMAIL } from "@/lib/sessionCredits";
import { listOrdersForCustomer } from "@/lib/api/ordersApi";
import {
  canClientCreatePendingBooking,
  createBooking,
  getSessionsLeftForClient,
  listByDate,
  listForClient,
  slotConflicts,
  slotStartsForDay,
  updateBookingStatus,
} from "@/lib/bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const startOfToday = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

const UserDashboard = () => {
  const session = getMemberSession();
  const email = session?.email ?? "";
  const [searchParams, setSearchParams] = useSearchParams();
  const bookIntent = searchParams.get("book") === "1";
  const bookingRef = useRef<HTMLElement>(null);
  const [storeVersion, setStoreVersion] = useState(0);
  const bump = () => setStoreVersion((n) => n + 1);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!bookIntent || !bookingRef.current) return;
    bookingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    const t = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.delete("book");
      setSearchParams(next, { replace: true });
    }, 500);
    return () => window.clearTimeout(t);
  }, [bookIntent, searchParams, setSearchParams]);

  const sessionsLeft = email ? getSessionsLeftForClient(email) : 0;
  const dayBookings = useMemo(
    () => {
      void storeVersion;
      return email ? listByDate(selectedDate, { clientEmail: email }) : [];
    },
    [email, selectedDate, storeVersion],
  );
  const slots = slotStartsForDay(selectedDate);

  const handleBookSlot = (start: Date) => {
    if (!email) return;
    if (!canClientCreatePendingBooking(email)) {
      toast.error("No sessions left this month. Buy a monthly package or add sessions at checkout.");
      return;
    }
    const end = new Date(start);
    end.setHours(start.getHours() + 1, 0, 0, 0);
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    if (slotConflicts(startISO, endISO, DEMO_TRAINER_EMAIL)) {
      toast.error("That time was just taken. Pick another slot.");
      return;
    }
    createBooking({
      clientEmail: email,
      trainerEmail: DEMO_TRAINER_EMAIL,
      startISO,
      endISO,
      title: "Training session",
      status: "pending",
    });
    toast.success("Request sent — your coach will confirm.");
    bump();
  };

  const handleCancelPending = (id: string) => {
    updateBookingStatus(id, "cancelled");
    toast.success("Booking cancelled.");
    bump();
  };

  return (
    <div className="max-w-5xl">
      <h1 className="mb-2 font-display text-3xl">Your dashboard</h1>
      <p className="mb-8 text-muted-foreground">Welcome back{email ? `, ${email}` : ""}.</p>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="border-primary/30 bg-card/80 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">Sessions left this month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl text-primary">{sessionsLeft}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Pending and confirmed bookings each use one slot. Purchase a monthly package to add sessions.
            </p>
            {sessionsLeft === 0 && (
              <Button asChild className="mt-4 bg-secondary text-white hover:bg-secondary/90" size="sm">
                <Link to="/store">Browse packages</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/80 md:col-span-1">
          <CardHeader>
            <CardTitle className="font-display text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {listOrdersForCustomer(email).length === 0 ? (
              <p className="mb-4 text-sm text-muted-foreground">No orders yet—browse the store when you are ready.</p>
            ) : (
              <div className="mb-4 space-y-2 text-sm">
                {listOrdersForCustomer(email)
                  .slice(0, 2)
                  .map((order) => (
                    <div key={order.id} className="rounded-md border border-border p-2">
                      <p className="font-medium">${order.total.toFixed(2)} · {order.status}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  ))}
              </div>
            )}
            <Button asChild variant="outline" size="sm">
              <Link to="/store">Go to store</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-card/80 md:col-span-1">
          <CardHeader>
            <CardTitle className="font-display text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Update your details and preferences.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/settings">Account settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section ref={bookingRef} id="member-book" className="scroll-mt-24">
        <h2 className="mb-4 font-display text-xl tracking-wide text-white">Book a session</h2>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                disabled={(d) => {
                  const x = new Date(d);
                  x.setHours(0, 0, 0, 0);
                  return x < startOfToday();
                }}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="font-display text-base">{format(selectedDate, "EEEE, MMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Your bookings this day</p>
                {dayBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing scheduled.</p>
                ) : (
                  <ul className="space-y-2">
                    {dayBookings.map((b) => (
                      <li
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                      >
                        <span>
                          {format(new Date(b.startISO), "h:mm a")} – {format(new Date(b.endISO), "h:mm a")} ·{" "}
                          <span className="text-muted-foreground">{b.status}</span>
                        </span>
                        {b.status === "pending" && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleCancelPending(b.id)}>
                            Cancel
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Available slots (1 hour)</p>
                {!canClientCreatePendingBooking(email) ? (
                  <p className="text-sm text-muted-foreground">No session credits left for this month.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((start) => {
                      const end = new Date(start);
                      end.setHours(start.getHours() + 1, 0, 0, 0);
                      const busy = slotConflicts(start.toISOString(), end.toISOString(), DEMO_TRAINER_EMAIL);
                      return (
                        <Button
                          key={start.toISOString()}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          className="font-mono text-xs"
                          onClick={() => handleBookSlot(start)}
                        >
                          {format(start, "h:mm a")}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mt-10 text-xs text-muted-foreground">
        <p className="font-display tracking-wide">Upcoming (all statuses)</p>
        <ul className="mt-2 space-y-1">
          {listForClient(email)
            .filter((b) => new Date(b.startISO) >= startOfToday())
            .slice(0, 8)
            .map((b) => (
              <li key={b.id}>
                {format(new Date(b.startISO), "MMM d, h:mm a")} — {b.title} ({b.status})
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default UserDashboard;
