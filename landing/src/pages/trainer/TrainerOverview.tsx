import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Bell, Users, MessageSquare, CalendarClock, ClipboardList } from "lucide-react";
import { getTrainerSession } from "@/lib/auth";
import {
  mockNotifications,
  mockStatistics,
  mockClients,
  mockChatThreads,
  mockComingSessions,
  mockBookingRequests,
} from "@/data/mockTrainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TrainerOverview = () => {
  const session = getTrainerSession();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [bookings, setBookings] = useState(mockBookingRequests);

  const newClients = useMemo(() => mockClients.filter((c) => c.status === "new"), []);
  const unreadMessages = useMemo(
    () => mockChatThreads.filter((t) => t.unread > 0),
    [],
  );

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const confirmBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast.success("Session booking confirmed (demo).");
  };

  const declineBooking = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast.message("Booking declined (demo).");
  };

  return (
    <div className="max-w-6xl space-y-10">
      <div>
        <h1 className="font-display text-3xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Coach admin overview{session?.email ? ` — ${session.email}` : ""}. Demo data only —
          backend not connected yet.
        </p>
      </div>

      {/* Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg tracking-wide">Statistics</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockStatistics.map((stat) => (
            <Card key={stat.label} className="bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-sm text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Notifications */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg tracking-wide">Notifications</h2>
            </div>
            <Badge variant="secondary">
              {notifications.filter((n) => !n.read).length} new
            </Badge>
          </div>
          <Card className="bg-card/80">
            <CardContent className="divide-y divide-border p-0">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between gap-3 px-4 py-3 ${
                    n.read ? "opacity-70" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {format(new Date(n.at), "MMM d · h:mm a")}
                    </p>
                  </div>
                  {!n.read && (
                    <Button type="button" size="sm" variant="outline" onClick={() => markRead(n.id)}>
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* New Clients */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg tracking-wide">New Clients</h2>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/trainer/workouts">Assign routine</Link>
            </Button>
          </div>
          <Card className="bg-card/80">
            <CardContent className="divide-y divide-border p-0">
              {newClients.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No new clients.</p>
              ) : (
                newClients.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.goal} · joined {c.joinedAt}
                      </p>
                    </div>
                    <Badge>new</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {/* Messages preview */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg tracking-wide">Messages</h2>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/trainer/chat">Open chat</Link>
            </Button>
          </div>
          <Card className="bg-card/80">
            <CardContent className="divide-y divide-border p-0">
              {unreadMessages.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Inbox clear.</p>
              ) : (
                unreadMessages.map((t) => (
                  <Link
                    key={t.id}
                    to="/trainer/chat"
                    className="block px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{t.clientName}</p>
                      <Badge variant="secondary">{t.unread}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{t.lastPreview}</p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {/* Coming up sessions */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h2 className="font-display text-lg tracking-wide">Coming up sessions</h2>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/trainer/calendar">Calendar</Link>
            </Button>
          </div>
          <Card className="bg-card/80">
            <CardContent className="divide-y divide-border p-0">
              {mockComingSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
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
        </section>
      </div>

      {/* Booking Sessions */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg tracking-wide">Booking Sessions</h2>
        </div>
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Pending requests</CardTitle>
            <CardDescription>Confirm or decline client booking requests (demo).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending booking requests.</p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-display text-sm tracking-wide">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.client}</p>
                    <p className="mt-1 font-mono text-sm">
                      {format(new Date(b.startISO), "EEE MMM d · h:mm a")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{b.note}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-secondary text-white hover:bg-secondary/90"
                      onClick={() => confirmBooking(b.id)}
                    >
                      Confirm
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => declineBooking(b.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default TrainerOverview;
