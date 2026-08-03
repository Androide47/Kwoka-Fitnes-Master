import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { getMemberSession } from "@/lib/auth";
import { DEMO_TRAINER_EMAIL } from "@/lib/sessionCredits";
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
import { isDayLocked, listLockedDays } from "@/lib/api/lockedDaysApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

const startOfToday = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

const UserCalendar = () => {
  const session = getMemberSession();
  const email = session?.user.email ?? "";
  const [storeVersion, setStoreVersion] = useState(0);
  const bump = () => setStoreVersion((n) => n + 1);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const sessionsLeft = email ? getSessionsLeftForClient(email) : 0;
  const dayBookings = useMemo(() => {
    void storeVersion;
    return email ? listByDate(selectedDate, { clientEmail: email }) : [];
  }, [email, selectedDate, storeVersion]);

  const slots = slotStartsForDay(selectedDate);
  const selectedDayKey = format(selectedDate, "yyyy-MM-dd");
  const coachUnavailable = isDayLocked(DEMO_TRAINER_EMAIL, selectedDayKey);
  const lockedDates = useMemo(() => {
    void storeVersion;
    return listLockedDays(DEMO_TRAINER_EMAIL).map((key) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m - 1, d);
    });
  }, [storeVersion]);

  const upcoming = useMemo(() => {
    void storeVersion;
    return listForClient(email)
      .filter((b) => new Date(b.startISO) >= startOfToday() && b.status !== "cancelled")
      .slice(0, 8);
  }, [email, storeVersion]);

  const handleBookSlot = (start: Date) => {
    if (!email) return;
    if (isDayLocked(DEMO_TRAINER_EMAIL, format(start, "yyyy-MM-dd"))) {
      toast.error("Your coach is not available that day.");
      return;
    }
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
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Calendar</h1>
          <p className="text-muted-foreground">
            Book sessions with your coach · {sessionsLeft} credit
            {sessionsLeft === 1 ? "" : "s"} left this month
          </p>
        </div>
        {sessionsLeft === 0 && (
          <Button asChild className="bg-secondary text-white hover:bg-secondary/90" size="sm">
            <Link to="/store">Get session credits</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(20rem,22rem)_1fr]">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Pick a day</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-2 sm:p-4">
            <DatePicker
              size="lg"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              minDate={startOfToday()}
              lockedDates={lockedDates}
            />
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">
              {format(selectedDate, "EEEE, MMM d, yyyy")}
            </CardTitle>
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
                        {format(new Date(b.startISO), "h:mm a")} –{" "}
                        {format(new Date(b.endISO), "h:mm a")} ·{" "}
                        <span className="text-muted-foreground">{b.status}</span>
                      </span>
                      {b.status === "pending" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelPending(b.id)}
                        >
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
              {coachUnavailable ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Your coach is not available on this day. Please pick another date.
                </p>
              ) : !canClientCreatePendingBooking(email) ? (
                <p className="text-sm text-muted-foreground">No session credits left for this month.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((start) => {
                    const end = new Date(start);
                    end.setHours(start.getHours() + 1, 0, 0, 0);
                    const busy = slotConflicts(
                      start.toISOString(),
                      end.toISOString(),
                      DEMO_TRAINER_EMAIL,
                    );
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

      <div>
        <h2 className="mb-3 font-display text-lg tracking-wide">Upcoming sessions</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                {format(new Date(b.startISO), "MMM d, h:mm a")} — {b.title}{" "}
                <span className="text-muted-foreground">({b.status})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserCalendar;
