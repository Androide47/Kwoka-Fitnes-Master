import { useMemo, useState } from "react";
import { format, isSameMonth, startOfMonth } from "date-fns";
import { getTrainerSession } from "@/lib/auth";
import { DEMO_TRAINER_EMAIL } from "@/lib/sessionCredits";
import { listForTrainer, updateBookingStatus, type Booking } from "@/lib/bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const demoTrainerBookings = (): Booking[] => listForTrainer(DEMO_TRAINER_EMAIL);

const TrainerSchedule = () => {
  const session = getTrainerSession();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [storeVersion, setStoreVersion] = useState(0);
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

  return (
    <div className="max-w-5xl">
      <h1 className="mb-2 font-display text-3xl">Schedule</h1>
      <p className="mb-2 text-muted-foreground">
        Demo calendar — sessions for <span className="text-foreground">{DEMO_TRAINER_EMAIL}</span>.
        {session?.email ? ` Signed in as ${session.email}.` : ""}
      </p>
      <p className="mb-8 text-xs text-muted-foreground">
        Confirm requests to lock them in; cancel frees the slot for the client.
      </p>

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
            <CardTitle className="font-display text-base">{format(selectedDate, "EEEE, MMM d, yyyy")}</CardTitle>
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
                          {format(new Date(b.startISO), "h:mm a")} – {format(new Date(b.endISO), "h:mm a")}
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
                            <Button type="button" size="sm" variant="outline" onClick={() => handleCancel(b.id)}>
                              Decline
                            </Button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <Button type="button" size="sm" variant="outline" onClick={() => handleCancel(b.id)}>
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

      <Card className="mt-10 bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">All upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {all
              .filter((b) => new Date(b.startISO) >= new Date(new Date().setHours(0, 0, 0, 0)))
              .slice(0, 20)
              .map((b) => (
                <li key={b.id} className="flex flex-wrap justify-between gap-2 border-b border-border/60 py-2 last:border-0">
                  <span>
                    {format(new Date(b.startISO), "MMM d, h:mm a")} — {b.clientEmail}
                  </span>
                  <span className="text-muted-foreground">{b.status}</span>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerSchedule;
