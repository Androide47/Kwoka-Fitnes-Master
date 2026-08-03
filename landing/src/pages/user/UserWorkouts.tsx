import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { memberWorkoutsApi, type MemberWorkoutView } from "@/lib/api/memberWorkoutsApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

function WorkoutRow({ workout }: { workout: MemberWorkoutView }) {
  return (
    <Card className="bg-card/80">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(workout.scheduledFor), "EEEE, MMM d")}
            </p>
            <CardTitle className="font-display text-base">{workout.name}</CardTitle>
          </div>
          <Badge variant={workout.status === "completed" ? "default" : "outline"}>
            {workout.status}
          </Badge>
        </div>
        <CardDescription>{workout.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {workout.exercises.length} exercise{workout.exercises.length === 1 ? "" : "s"}
        </p>
        <Button asChild size="sm" variant="outline">
          <Link to={`/workouts/${workout.id}`}>
            {workout.status === "upcoming" ? "Start" : "View"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

const UserWorkouts = () => {
  const [tab, setTab] = useState("upcoming");
  const upcoming = useMemo(() => memberWorkoutsApi.listUpcoming(), [tab]);
  const past = useMemo(() => memberWorkoutsApi.listPast(), [tab]);

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Dumbbell className="h-6 w-6 text-primary" />
        <div>
          <h1 className="font-display text-3xl">Workouts</h1>
          <p className="text-muted-foreground">Sessions your coach assigned for you.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming workouts. Check back soon.</p>
          ) : (
            upcoming.map((w) => <WorkoutRow key={w.id} workout={w} />)
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed or missed workouts yet.</p>
          ) : (
            past.map((w) => <WorkoutRow key={w.id} workout={w} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserWorkouts;
