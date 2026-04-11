import { mockSchedule } from "@/data/mockTrainer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const TrainerSchedule = () => (
  <div className="max-w-3xl">
    <h1 className="font-display text-3xl mb-2">Schedule</h1>
    <p className="text-muted-foreground mb-8">Upcoming sessions on your calendar (sample data).</p>
    <div className="space-y-3">
      {mockSchedule.map((slot) => (
        <Card key={slot.id} className="bg-card/80">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-base">{slot.client}</CardTitle>
              <p className="text-sm text-muted-foreground">{slot.type}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-sm tracking-wider">{slot.day}</p>
              <p className="text-sm text-white">{slot.time}</p>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  </div>
);

export default TrainerSchedule;
