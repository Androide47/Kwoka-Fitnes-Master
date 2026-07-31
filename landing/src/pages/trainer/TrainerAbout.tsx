import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TrainerAbout = () => (
  <div className="max-w-2xl space-y-8">
    <div>
      <h1 className="font-display text-3xl mb-2">About</h1>
      <p className="text-muted-foreground">
        Coach admin panel for Kwoka Fitness — guided by the product architecture diagram.
      </p>
    </div>

    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-base">Kwoka Admin Panel</CardTitle>
        <CardDescription>Demo UI for testing coach workflows before backend wiring.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          This panel mirrors the drawio coach admin features: Dashboard (notifications, statistics,
          new clients, messages, upcoming sessions, booking requests), Workouts (exercises →
          workouts → routines, then set routine for a client), Calendar, Chat, Blog, Settings, and
          About.
        </p>
        <p>
          Data is mock / local state only. Payments, Cognito, and AWS Lambda are not connected yet.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/">Landing page</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/trainer">Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/contact">Contact</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default TrainerAbout;
