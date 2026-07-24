import { Link, useParams } from "react-router-dom";
import { trainerApi } from "@/lib/api/trainerApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TrainerClientDetail = () => {
  const { id } = useParams();
  const client = id ? trainerApi.getTrainerClient(id) : null;

  if (!client) {
    return (
      <div className="max-w-3xl">
        <h1 className="mb-2 font-display text-3xl">Client not found</h1>
        <p className="mb-6 text-muted-foreground">This demo client is not assigned to the signed-in trainer.</p>
        <Button asChild variant="outline">
          <Link to="/trainer/clients">Back to clients</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link to="/trainer/clients" className="mb-6 inline-block text-sm text-muted-foreground hover:text-white">
        Back to clients
      </Link>
      <h1 className="mb-2 font-display text-3xl">{client.name}</h1>
      <p className="mb-8 text-muted-foreground">{client.email}</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{client.goal}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">Last session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{client.lastSession}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{client.sessionsCompleted} sessions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-card/80">
        <CardHeader>
          <CardTitle className="font-display text-base">Progress summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{client.progressSummary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-secondary text-white hover:bg-secondary/90">
              <Link to="/trainer/schedule">Schedule session</Link>
            </Button>
            <Button variant="outline" disabled>
              Message shortcut pending backend
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerClientDetail;
