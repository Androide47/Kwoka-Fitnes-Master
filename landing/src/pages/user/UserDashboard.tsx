import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Flame, Dumbbell, CalendarDays, MessageSquare, ShoppingBag, TrendingUp } from "lucide-react";
import { getMemberSession } from "@/lib/auth";
import { listOrdersForCustomer } from "@/lib/api/ordersApi";
import { getSessionsLeftForClient, listForClient } from "@/lib/bookings";
import { memberStreakApi } from "@/lib/api/memberStreakApi";
import { memberWorkoutsApi } from "@/lib/api/memberWorkoutsApi";
import { memberChatApi } from "@/lib/api/memberChatApi";
import { memberProgressApi } from "@/lib/api/memberProgressApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const startOfToday = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

const UserDashboard = () => {
  const session = getMemberSession();
  const email = session?.user.email ?? "";
  const name = session?.user.name ?? email.split("@")[0] ?? "athlete";

  const [streak, setStreak] = useState(() => memberStreakApi.get());

  useEffect(() => {
    setStreak(memberStreakApi.checkIn());
  }, []);

  const sessionsLeft = email ? getSessionsLeftForClient(email) : 0;
  const todayWorkout = memberWorkoutsApi.getToday();
  const upcomingWorkouts = memberWorkoutsApi.listUpcoming().slice(0, 3);
  const coachThread = memberChatApi.getCoachThread(name);
  const latestMeasurement = memberProgressApi.latestMeasurement();
  const upcomingBookings = useMemo(
    () =>
      listForClient(email)
        .filter((b) => new Date(b.startISO) >= startOfToday() && b.status !== "cancelled")
        .slice(0, 4),
    [email],
  );
  const recentOrders = listOrdersForCustomer(email).slice(0, 2);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="mb-2 font-display text-3xl">Welcome back, {name}</h1>
        <p className="text-muted-foreground">Your training hub — workouts, bookings, and progress.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/30 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-display text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" /> Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl text-primary">{streak.count}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {streak.lastCheckIn === new Date().toISOString().slice(0, 10)
                ? "Checked in today"
                : "Open the app daily to keep it going"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">
              Session credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl text-white">{sessionsLeft}</p>
            <Button asChild variant="link" className="mt-1 h-auto px-0 text-xs text-primary">
              <Link to="/calendar">Book a session →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-display text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Latest weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl text-white">
              {latestMeasurement?.measurements?.weightLb ?? "—"}
              {latestMeasurement?.measurements?.weightLb != null && (
                <span className="text-base text-muted-foreground"> lb</span>
              )}
            </p>
            <Button asChild variant="link" className="mt-1 h-auto px-0 text-xs text-primary">
              <Link to="/progress">Log progress →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-display text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" /> Coach chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">{coachThread.lastPreview}</p>
            <Button asChild variant="link" className="mt-1 h-auto px-0 text-xs text-primary">
              <Link to="/messages">Open messages →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Dumbbell className="h-4 w-4 text-primary" /> Today&apos;s workout
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!todayWorkout ? (
              <p className="mb-4 text-sm text-muted-foreground">No workout scheduled for today.</p>
            ) : (
              <div className="mb-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg">{todayWorkout.name}</p>
                  <Badge variant="outline">{todayWorkout.status}</Badge>
                </div>
                <CardDescription>{todayWorkout.description}</CardDescription>
                <p className="text-xs text-muted-foreground">
                  {todayWorkout.exercises.length} exercises
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {todayWorkout && (
                <Button asChild className="bg-secondary text-white hover:bg-secondary/90" size="sm">
                  <Link to={`/workouts/${todayWorkout.id}`}>
                    {todayWorkout.status === "upcoming" ? "Start workout" : "View workout"}
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link to="/workouts">All workouts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <CalendarDays className="h-4 w-4 text-primary" /> Upcoming sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <p className="mb-4 text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ul className="mb-4 space-y-2 text-sm">
                {upcomingBookings.map((b) => (
                  <li key={b.id} className="rounded-md border border-border px-3 py-2">
                    {format(new Date(b.startISO), "MMM d, h:mm a")} — {b.title}{" "}
                    <span className="text-muted-foreground">({b.status})</span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild className="bg-secondary text-white hover:bg-secondary/90" size="sm">
              <Link to="/calendar">Book a session</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-base">Coming up workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing assigned yet.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingWorkouts.map((w) => (
                  <li key={w.id}>
                    <Link
                      to={`/workouts/${w.id}`}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/40"
                    >
                      <span>
                        <span className="text-muted-foreground">
                          {format(parseISO(w.scheduledFor), "MMM d")} ·{" "}
                        </span>
                        {w.name}
                      </span>
                      <span className="text-xs text-primary">Open</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <ShoppingBag className="h-4 w-4 text-primary" /> Orders & store
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="mb-4 text-sm text-muted-foreground">
                No orders yet — packages add session credits.
              </p>
            ) : (
              <div className="mb-4 space-y-2 text-sm">
                {recentOrders.map((order) => (
                  <div key={order.id} className="rounded-md border border-border p-2">
                    <p className="font-medium">
                      ${order.total.toFixed(2)} · {order.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/store">Go to store</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/settings">Account settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
