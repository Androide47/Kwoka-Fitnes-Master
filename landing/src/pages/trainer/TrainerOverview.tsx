import { Link } from "react-router-dom";
import { getTrainerSession } from "@/lib/auth";
import { mockClients, mockSchedule } from "@/data/mockTrainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TrainerOverview = () => {
  const session = getTrainerSession();

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
            <p className="text-3xl font-semibold">{mockSchedule.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">Next up</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{mockSchedule[0]?.client ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {mockSchedule[0]?.day} {mockSchedule[0]?.time}
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
