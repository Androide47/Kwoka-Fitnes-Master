import { useMemo, useState } from "react";
import { format, isSameMonth, startOfMonth } from "date-fns";
import { getTrainerSession } from "@/lib/auth";
import { DEMO_TRAINER_EMAIL } from "@/lib/sessionCredits";
import { listForTrainer, updateBookingStatus, type Booking } from "@/lib/bookings";
import { mockComingSessions, mockBookingRequests } from "@/data/mockTrainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const demoTrainerBookings = (): Booking[] => listForTrainer(DEMO_TRAINER_EMAIL);

const TrainerCalendar = () => {
  const session = getTrainerSession();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [storeVersion, setStoreVersion] = useState(0);
  const [demoRequests, setDemoRequests] = useState(mockBookingRequests);
  const bump = () => setStoreVersion((n) => n + 1);

  const all = demoTrainerBookings();

  const monthBookings = useMemo(
    () => all.filter((b) => isSameMonth(new Date(b.startISO), month)),
    [all, month],
  );

  const selectedDayBookings = useMemo(
    () =>
      all.filter((b) => {
        const d = new Date(b.startISO);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      }),
    [all, selectedDate],
  );

  const handleConfirm = (id: string) => {
    updateBookingStatus(id, "confirmed");
    toast.success("Session confirmed.");
    bump();
  };

  const handleCancel = (id: string) => {
    updateBookingStatus(id, "cancelled");
    toast.success("Booking cancelled.");
    bump();
  };

  const confirmDemo = (id: string) => {
    setDemoRequests((prev) => prev.filter((b) => b.id !== id));
    toast.success("Demo booking confirmed.");
  };

  return (
    <div className="max-w-5xl space-y-10">
      <div>
        <h1 className="mb-2 font-display text-3xl">Calendar</h1>
        <p className="mb-2 text-muted-foreground">
          Sessions for <span className="text-foreground">{DEMO_TRAINER_EMAIL}</span>
          {session?.email ? ` · signed in as ${session.email}` : ""}.
        </p>
        <p className="text-xs text-muted-foreground">
          Coming up sessions and booking requests from the admin diagram — demo + local bookings.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Month</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-2">
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="rounded-md border-0"
            />
            <p className="text-center text-xs text-muted-foreground">
              {monthBookings.length} active booking{monthBookings.length === 1 ? "" : "s"} this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">
              {format(selectedDate, "EEEE, MMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions this day.</p>
            ) : (
              <ul className="space-y-3">
                {selectedDayBookings.map((b) => (
                  <li key={b.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-sm tracking-wide">{b.title}</p>
                        <p className="text-xs text-muted-foreground">{b.clientEmail}</p>
                        <p className="mt-1 font-mono text-sm">
                          {format(new Date(b.startISO), "h:mm a")} –{" "}
                          {format(new Date(b.endISO), "h:mm a")}
                        </p>
                        <p className="mt-1 text-xs uppercase text-primary">{b.status}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.status === "pending" && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              className="bg-secondary text-white hover:bg-secondary/90"
                              onClick={() => handleConfirm(b.id)}
                            >
                              Confirm
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(b.id)}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(b.id)}
                          >
                            Cancel session
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Coming up sessions</CardTitle>
            <CardDescription>Sample upcoming list from the admin diagram.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockComingSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 border-b border-border/60 py-2 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.client} · {format(new Date(s.startISO), "EEE MMM d · h:mm a")}
                  </p>
                </div>
                <Badge variant={s.status === "confirmed" ? "default" : "secondary"}>
                  {s.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Booking Sessions</CardTitle>
            <CardDescription>Pending requests (demo).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            ) : (
              demoRequests.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{b.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.client} · {format(new Date(b.startISO), "MMM d · h:mm a")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-secondary text-white hover:bg-secondary/90"
                    onClick={() => confirmDemo(b.id)}
                  >
                    Confirm
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerCalendar;
