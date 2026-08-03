import { useMemo, useState, type FormEvent } from "react";
import { format, parseISO } from "date-fns";
import {
  memberProgressApi,
  type ProgressEntry,
  type ProgressEntryType,
} from "@/lib/api/memberProgressApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

function EntryCard({ entry, onDelete }: { entry: ProgressEntry; onDelete: () => void }) {
  return (
    <Card className="bg-card/80">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(entry.date), "MMM d, yyyy")}
            </p>
            <CardTitle className="font-display text-base capitalize">{entry.type}</CardTitle>
          </div>
          <Badge variant="outline">{entry.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {entry.type === "measurement" && entry.measurements && (
          <ul className="space-y-1">
            {entry.measurements.weightLb != null && <li>Weight: {entry.measurements.weightLb} lb</li>}
            {entry.measurements.bodyFat != null && <li>Body fat: {entry.measurements.bodyFat}%</li>}
            {entry.measurements.chestIn != null && <li>Chest: {entry.measurements.chestIn} in</li>}
            {entry.measurements.waistIn != null && <li>Waist: {entry.measurements.waistIn} in</li>}
            {entry.measurements.hipsIn != null && <li>Hips: {entry.measurements.hipsIn} in</li>}
            {entry.measurements.armsIn != null && <li>Arms: {entry.measurements.armsIn} in</li>}
            {entry.measurements.thighsIn != null && <li>Thighs: {entry.measurements.thighsIn} in</li>}
          </ul>
        )}
        {entry.type === "photo" && entry.photos && (
          <p>{entry.photos.join(", ")}</p>
        )}
        {entry.notes && <p>{entry.notes}</p>}
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}

const UserProgress = () => {
  const [filter, setFilter] = useState<ProgressEntryType | "all">("all");
  const [version, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [entryType, setEntryType] = useState<ProgressEntryType>("note");
  const [notes, setNotes] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [waistIn, setWaistIn] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");

  const entries = useMemo(() => {
    void version;
    return memberProgressApi.list(filter);
  }, [filter, version]);

  const resetForm = () => {
    setNotes("");
    setWeightLb("");
    setWaistIn("");
    setPhotoCaption("");
    setEntryType("note");
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (entryType === "note" && !notes.trim()) {
      toast.error("Add a note.");
      return;
    }
    if (entryType === "photo" && !photoCaption.trim() && !notes.trim()) {
      toast.error("Add a photo caption or note.");
      return;
    }
    if (entryType === "measurement" && !weightLb.trim() && !waistIn.trim()) {
      toast.error("Enter at least one measurement.");
      return;
    }

    memberProgressApi.add({
      type: entryType,
      notes: notes.trim() || undefined,
      photos: entryType === "photo" ? [photoCaption.trim() || "Progress photo (demo)"] : undefined,
      measurements:
        entryType === "measurement"
          ? {
              weightLb: weightLb ? Number(weightLb) : undefined,
              waistIn: waistIn ? Number(waistIn) : undefined,
            }
          : undefined,
    });
    toast.success("Progress entry saved.");
    resetForm();
    setOpen(false);
    setVersion((n) => n + 1);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Progress</h1>
          <p className="text-muted-foreground">Photos, measurements, and training notes.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary text-white hover:bg-secondary/90">
              <Plus className="mr-1.5 h-4 w-4" /> Add entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">New progress entry</DialogTitle>
              <DialogDescription>Demo only — stored in this browser.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(["note", "measurement", "photo"] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={entryType === t ? "default" : "outline"}
                    onClick={() => setEntryType(t)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
              {entryType === "measurement" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="prog-weight">Weight (lb)</Label>
                    <Input
                      id="prog-weight"
                      type="number"
                      step="0.1"
                      value={weightLb}
                      onChange={(e) => setWeightLb(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prog-waist">Waist (in)</Label>
                    <Input
                      id="prog-waist"
                      type="number"
                      step="0.1"
                      value={waistIn}
                      onChange={(e) => setWaistIn(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {entryType === "photo" && (
                <div className="space-y-2">
                  <Label htmlFor="prog-photo">Photo caption</Label>
                  <Input
                    id="prog-photo"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="Front / side / back (demo)"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="prog-notes">Notes</Label>
                <Textarea
                  id="prog-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90">
                Save entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as ProgressEntryType | "all")}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="measurement">Measurements</TabsTrigger>
          <TabsTrigger value="photo">Photos</TabsTrigger>
          <TabsTrigger value="note">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4 space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={() => {
                  memberProgressApi.remove(entry.id);
                  setVersion((n) => n + 1);
                  toast.success("Entry removed.");
                }}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProgress;
