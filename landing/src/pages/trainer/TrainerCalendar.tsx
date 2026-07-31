import { useCallback, useMemo, useState } from "react";
import { addDays, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { getTrainerSession } from "@/lib/auth";
import { DEMO_TRAINER_EMAIL } from "@/lib/sessionCredits";
import {
  createBooking,
  listForTrainer,
  slotConflicts,
  updateBookingStatus,
  type Booking,
} from "@/lib/bookings";
import { isDayLocked, listLockedDays, setDayLocked } from "@/lib/api/lockedDaysApi";
import { listTrainerClients } from "@/lib/api/trainerApi";
import { mockComingSessions, mockBookingRequests } from "@/data/mockTrainer";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Lock,
  LockOpen,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const demoTrainerBookings = (): Booking[] => listForTrainer(DEMO_TRAINER_EMAIL);

// Workout hours: 1-hour slots from 6:00 AM to 10:00 PM (last slot 9-10 PM).
const OPEN_HOUR = 6;
const CLOSE_HOUR = 22;

type SlotStatus = "available" | "booked" | "past" | "locked";

const parseDayKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

type HourSlot = {
  start: Date;
  end: Date;
  status: SlotStatus;
};

const TrainerCalendar = () => {
  const session = getTrainerSession();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [storeVersion, setStoreVersion] = useState(0);
  const [demoRequests, setDemoRequests] = useState(mockBookingRequests);
  const [view, setView] = useState<"month" | "week">("month");
  const bump = () => setStoreVersion((n) => n + 1);

  const all = demoTrainerBookings();

  const monthBookings = useMemo(
    () => all.filter((b) => isSameMonth(new Date(b.startISO), month)),
    [all, month],
  );

  // Calendar day (yyyy-MM-dd) the coach picked; slots and bookings are
  // resolved for that day in the selected time zone.
  const selectedDayKey = format(selectedDate, "yyyy-MM-dd");

  const selectedDayBookings = useMemo(
    () => all.filter((b) => format(new Date(b.startISO), "yyyy-MM-dd") === selectedDayKey),
    [all, selectedDayKey],
  );

  // storeVersion re-reads locks/bookings from localStorage after changes.
  const dayLocked = useMemo(
    () => isDayLocked(DEMO_TRAINER_EMAIL, selectedDayKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDayKey, storeVersion],
  );

  const lockedDates = useMemo(
    () => listLockedDays(DEMO_TRAINER_EMAIL).map(parseDayKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeVersion],
  );

  // Working hours are fixed to the gym's local time; the time zone selector
  // only changes how the resulting times are displayed.
  const buildDaySlots = useCallback((dayKey: string, locked: boolean): HourSlot[] => {
    const now = Date.now();
    const base = parseDayKey(dayKey);
    return Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => {
      const start = new Date(base);
      start.setHours(OPEN_HOUR + i, 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const booked = slotConflicts(start.toISOString(), end.toISOString(), DEMO_TRAINER_EMAIL);
      const status: SlotStatus = booked
        ? "booked"
        : end.getTime() <= now
          ? "past"
          : locked
            ? "locked"
            : "available";
      return { start, end, status };
    });
  }, []);

  const hourSlots = useMemo<HourSlot[]>(
    () => buildDaySlots(selectedDayKey, dayLocked),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [buildDaySlots, selectedDayKey, dayLocked, storeVersion],
  );

  const availableCount = hourSlots.filter((s) => s.status === "available").length;

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);

  // Monday through Saturday — the gym doesn't take sessions on Sundays.
  const weekDays = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const date = addDays(weekStart, i);
        const key = format(date, "yyyy-MM-dd");
        const locked = isDayLocked(DEMO_TRAINER_EMAIL, key);
        const slots = buildDaySlots(key, locked);
        const bookings = all.filter((b) => format(new Date(b.startISO), "yyyy-MM-dd") === key);
        return {
          date,
          key,
          locked,
          bookings,
          totalSlots: slots.length,
          availableCount: slots.filter((s) => s.status === "available").length,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart, buildDaySlots, all, storeVersion],
  );

  // Session creator dialog state.
  const [creatorDay, setCreatorDay] = useState<string | null>(null);
  const [draftStartISO, setDraftStartISO] = useState("");
  const [draftClient, setDraftClient] = useState("");
  const [draftTitle, setDraftTitle] = useState("Training session");
  const [clientPickerOpen, setClientPickerOpen] = useState(false);

  const clients = useMemo(() => listTrainerClients(), []);
  const selectedClient = clients.find((c) => c.email === draftClient) ?? null;

  const openCreator = (dayKey: string) => {
    setDraftStartISO("");
    setDraftClient("");
    setDraftTitle("Training session");
    setClientPickerOpen(false);
    setCreatorDay(dayKey);
  };

  const creatorSlots = useMemo(
    () =>
      creatorDay
        ? buildDaySlots(creatorDay, false).filter((s) => s.status === "available")
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [creatorDay, buildDaySlots, storeVersion],
  );

  const handleCreateSession = () => {
    if (!draftStartISO) {
      toast.error("Pick a start time.");
      return;
    }
    if (!draftClient) {
      toast.error("Select a client.");
      return;
    }
    const start = new Date(draftStartISO);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    if (slotConflicts(start.toISOString(), end.toISOString(), DEMO_TRAINER_EMAIL)) {
      toast.error("That hour is already taken.");
      return;
    }
    createBooking({
      clientEmail: draftClient,
      trainerEmail: DEMO_TRAINER_EMAIL,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      title: draftTitle.trim() || "Training session",
      status: "confirmed",
    });
    toast.success("Session created.");
    setCreatorDay(null);
    bump();
  };

  const toggleLock = (dayKey: string, currentlyLocked: boolean) => {
    setDayLocked(DEMO_TRAINER_EMAIL, dayKey, !currentlyLocked);
    toast.success(
      currentlyLocked
        ? "Day unlocked — clients can book sessions again."
        : "Day locked — clients can no longer book this day.",
    );
    bump();
  };

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

      <Tabs
        value={view}
        onValueChange={(v) => setView(v as "month" | "week")}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
        </TabsList>

        <TabsContent value="month">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="font-display text-base">Month</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 p-2">
                <DatePicker
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (!d) return;
                    setSelectedDate(d);
                    setMonth(startOfMonth(d));
                  }}
                  openToDate={month}
                  onMonthChange={(d) => setMonth(startOfMonth(d))}
                  lockedDates={lockedDates}
                />
                <p className="text-center text-xs text-muted-foreground">
                  {monthBookings.length} active booking{monthBookings.length === 1 ? "" : "s"} this
                  month
                  {lockedDates.length > 0 &&
                    ` · ${lockedDates.length} locked day${lockedDates.length === 1 ? "" : "s"}`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="font-display text-base">
                  {format(selectedDate, "EEEE, MMM d, yyyy")}
                </CardTitle>
                <CardDescription>Working hours 6:00 AM – 10:00 PM · 1-hour sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">Sessions</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {dayLocked
                        ? "Day locked"
                        : `${availableCount} of ${hourSlots.length} hours free`}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openCreator(selectedDayKey)}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> Add session
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(
                        dayLocked
                          ? "border-primary/50 text-primary hover:text-primary"
                          : "border-destructive/50 text-destructive hover:text-destructive",
                      )}
                      onClick={() => toggleLock(selectedDayKey, dayLocked)}
                    >
                      {dayLocked ? (
                        <>
                          <LockOpen className="mr-1.5 h-3.5 w-3.5" /> Unlock day
                        </>
                      ) : (
                        <>
                          <Lock className="mr-1.5 h-3.5 w-3.5" /> Lock day
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {dayLocked && (
                  <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    This day is locked — clients see you as unavailable and cannot book sessions.
                  </p>
                )}
                <div>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week">
          <Card className="bg-card/80">
            <CardHeader>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Previous week"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="font-display text-base">
                  Week of {format(weekStart, "MMM d")} –{" "}
                  {format(addDays(weekStart, 5), "MMM d, yyyy")}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Next week"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Working hours 6:00 AM – 10:00 PM ·{" "}
                {weekDays.reduce((sum, d) => sum + d.availableCount, 0)} free hours this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {weekDays.map((day) => (
                  <div
                    key={day.key}
                    className={cn(
                      "flex flex-col rounded-lg border border-border p-2",
                      day.locked && "border-destructive/40 bg-destructive/5",
                      isSameDay(day.date, selectedDate) && "border-primary/60 bg-primary/5",
                    )}
                  >
                    <button
                      type="button"
                      className="block w-full text-left"
                      title="Open this day in the Month tab"
                      onClick={() => {
                        setSelectedDate(day.date);
                        setView("month");
                      }}
                    >
                      <p className="text-sm font-medium">{format(day.date, "EEE")}</p>
                      <p className="text-xs text-muted-foreground">{format(day.date, "MMM d")}</p>
                    </button>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {day.locked
                        ? "Locked"
                        : `${day.availableCount} of ${day.totalSlots} hours free`}
                    </p>
                    <div className="mt-2 flex-1 space-y-1">
                      {day.bookings.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground/60">No sessions</p>
                      ) : (
                        day.bookings.map((b) => (
                          <div
                            key={b.id}
                            title={`${b.title} · ${b.clientEmail} (${b.status})`}
                            className={cn(
                              "rounded border px-1.5 py-0.5 text-center font-mono text-[10px]",
                              b.status === "confirmed"
                                ? "border-secondary/60 bg-secondary/15 text-foreground"
                                : "border-border bg-muted/40 text-muted-foreground",
                            )}
                          >
                            {format(new Date(b.startISO), "h:mm a")}
                          </div>
                        ))
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 h-7 w-full text-xs"
                      onClick={() => openCreator(day.key)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(
                        "mt-1 h-7 w-full text-xs",
                        day.locked
                          ? "border-primary/50 text-primary hover:text-primary"
                          : "border-destructive/50 text-destructive hover:text-destructive",
                      )}
                      onClick={() => toggleLock(day.key, day.locked)}
                    >
                      {day.locked ? (
                        <>
                          <LockOpen className="mr-1 h-3 w-3" /> Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="mr-1 h-3 w-3" /> Lock
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      <Dialog open={creatorDay !== null} onOpenChange={(open) => !open && setCreatorDay(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">New session</DialogTitle>
            <DialogDescription>
              {creatorDay ? format(parseDayKey(creatorDay), "EEEE, MMM d, yyyy") : ""} · 1-hour
              session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Start time</Label>
              <Select value={draftStartISO} onValueChange={setDraftStartISO}>
                <SelectTrigger aria-label="Start time">
                  <SelectValue placeholder="Pick a free hour" />
                </SelectTrigger>
                <SelectContent>
                  {creatorSlots.map((slot) => (
                    <SelectItem key={slot.start.toISOString()} value={slot.start.toISOString()}>
                      {format(slot.start, "h:mm a")} – {format(slot.end, "h:mm a")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {creatorSlots.length === 0 && (
                <p className="text-xs text-muted-foreground">No free hours left on this day.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Popover modal open={clientPickerOpen} onOpenChange={setClientPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={clientPickerOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedClient ? (
                      <span className="truncate">
                        {selectedClient.name}{" "}
                        <span className="text-muted-foreground">· {selectedClient.email}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select a client</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search by name or email..." />
                    <CommandList>
                      <CommandEmpty>No client found.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.name} ${client.email}`}
                            onSelect={() => {
                              setDraftClient(client.email);
                              setClientPickerOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                draftClient === client.email ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm">{client.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {client.email}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-title">Title</Label>
              <Input
                id="session-title"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreatorDay(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-secondary text-white hover:bg-secondary/90"
              onClick={handleCreateSession}
            >
              Create session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainerCalendar;
