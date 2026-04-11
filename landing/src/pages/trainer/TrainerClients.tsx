import { mockClients } from "@/data/mockTrainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TrainerClients = () => (
  <div className="max-w-4xl">
    <h1 className="font-display text-3xl mb-2">Your clients</h1>
    <p className="text-muted-foreground mb-8">People you are coaching right now (sample data).</p>
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-base">Client list</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Last session</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockClients.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.goal}</TableCell>
                <TableCell className="text-muted-foreground">{c.lastSession}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default TrainerClients;
