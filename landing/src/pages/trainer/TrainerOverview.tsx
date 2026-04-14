import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { getTrainerSession } from "@/lib/auth";
import { mockClients } from "@/data/mockTrainer";
import { DEMO_TRAINER_EMAIL } from "@/lib/sessionCredits";
import { listForTrainer } from "@/lib/bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TrainerOverview = () => {
  const session = getTrainerSession();
  const { pathname } = useLocation();
  const upcoming = useMemo(() => {
    const now = Date.now();
    return listForTrainer(DEMO_TRAINER_EMAIL)
      .filter((b) => new Date(b.startISO).getTime() >= now)
      .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
  }, [pathname]);
  const next = upcoming[0];
  const weekCount = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return listForTrainer(DEMO_TRAINER_EMAIL).filter((b) => {
      const t = new Date(b.startISO).getTime();
      return t >= now.getTime() && t < weekEnd.getTime();
    }).length;
  }, [pathname]);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl mb-2">Overview</h1>
      <p className="text-muted-foreground mb-8">
        Coach tools for your practice{session?.email ? ` — ${session.email}` : ""}.
      </p>
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">Active clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{mockClients.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">Sessions this week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{weekCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">Next up</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{next?.clientEmail ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {next ? format(new Date(next.startISO), "EEE MMM d · h:mm a") : "No upcoming bookings"}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-secondary text-white hover:bg-secondary/90">
          <Link to="/trainer/clients">View clients</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/trainer/schedule">Open schedule</Link>
        </Button>
      </div>
    </div>
  );
};

export default TrainerOverview;
