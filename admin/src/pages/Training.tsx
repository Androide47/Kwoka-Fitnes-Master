import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, Input, Modal, PageHeader, Select, Table, Td, Textarea, statusTone } from "@/components/ui";
import { useI18n } from "@/i18n/LanguageContext";
import { adminApi, userName } from "@/lib/api";
import { formatDate } from "@/lib/cn";
import { useAsync } from "@/lib/useAsync";
import type { AppointmentStatus, Exercise, FitnessLevel, Workout } from "@/lib/types";

export function BookingsPage() {
  const { t, locale } = useI18n();
  const appts = useAsync(() => adminApi.appointments.list(), []);
  const users = useAsync(() => adminApi.users.list(), []);
  return (
    <div>
      <PageHeader title={t.bookings.title} subtitle={t.bookings.subtitle} />
      <Table headers={[t.bookings.when, t.common.name, t.bookings.trainer, t.bookings.client, t.bookings.location, t.common.status, t.common.actions]}>
        {(appts.data ?? []).map((a) => (
          <tr key={a.id}>
            <Td>{formatDate(a.startAt, locale)}</Td>
            <Td className="text-white">{a.title}</Td>
            <Td>{userName(users.data ?? [], a.trainerId)}</Td>
            <Td>{userName(users.data ?? [], a.clientId)}</Td>
            <Td>{a.location ?? "—"}</Td>
            <Td>
              <Badge tone={statusTone(a.status)}>{t.appointmentStatus[a.status]}</Badge>
            </Td>
            <Td>
              <Select
                value={a.status}
                onChange={async (e) => {
                  await adminApi.appointments.setStatus(a.id, e.target.value as AppointmentStatus);
                  toast.success(t.common.saved);
                  await appts.reload();
                }}
              >
                {Object.entries(t.appointmentStatus).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export function WorkoutsPage() {
  const { t } = useI18n();
  const q = useAsync(() => adminApi.workouts.list(), []);
  const users = useAsync(() => adminApi.users.list(), []);
  const exercises = useAsync(() => adminApi.exercises.list(), []);
  const [editing, setEditing] = useState<Workout | null>(null);
  return (
    <div>
      <PageHeader
        title={t.workouts.title}
        subtitle={t.workouts.subtitle}
        actions={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                name: "",
                description: "",
                createdBy: users.data?.find((u) => u.role === "trainer")?.id ?? "",
                durationMin: 45,
                difficulty: "intermediate",
                isTemplate: true,
                exerciseIds: [],
              })
            }
          >
            {t.workouts.newWorkout}
          </Button>
        }
      />
      <Table headers={[t.common.name, t.workouts.duration, t.common.status, t.workouts.assigned, t.common.actions]}>
        {(q.data ?? []).map((w) => (
          <tr key={w.id}>
            <Td className="text-white">{w.name}</Td>
            <Td>{w.durationMin}</Td>
            <Td>
              <Badge>{w.isTemplate ? t.workouts.template : t.workouts.assigned}</Badge>
            </Td>
            <Td>{userName(users.data ?? [], w.clientId)}</Td>
            <Td className="space-x-2">
              <Button variant="ghost" onClick={() => setEditing(w)}>
                {t.common.edit}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  if (!confirm(t.common.confirmDelete)) return;
                  await adminApi.workouts.remove(w.id);
                  await q.reload();
                }}
              >
                {t.common.delete}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
      {editing ? (
        <Modal open title={editing.id ? t.common.edit : t.workouts.newWorkout} onClose={() => setEditing(null)}>
          <Field label={t.common.name}>
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <Field label={t.common.details}>
            <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>
          <Field label={t.workouts.duration}>
            <Input type="number" value={editing.durationMin} onChange={(e) => setEditing({ ...editing, durationMin: Number(e.target.value) })} />
          </Field>
          <Field label={t.common.status}>
            <Select value={editing.difficulty} onChange={(e) => setEditing({ ...editing, difficulty: e.target.value as FitnessLevel })}>
              {Object.entries(t.difficulty).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.exercises.title}>
            <Select
              multiple
              value={editing.exerciseIds}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  exerciseIds: Array.from(e.target.selectedOptions).map((o) => o.value),
                })
              }
            >
              {(exercises.data ?? []).map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            onClick={async () => {
              await adminApi.workouts.save(editing);
              toast.success(t.common.saved);
              setEditing(null);
              await q.reload();
            }}
          >
            {t.common.save}
          </Button>
        </Modal>
      ) : null}
    </div>
  );
}

export function ExercisesPage() {
  const { t } = useI18n();
  const q = useAsync(() => adminApi.exercises.list(), []);
  const [editing, setEditing] = useState<Exercise | null>(null);
  return (
    <div>
      <PageHeader
        title={t.exercises.title}
        subtitle={t.exercises.subtitle}
        actions={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                name: "",
                description: "",
                category: "core",
                equipment: [],
                difficulty: "beginner",
                isLibrary: true,
              })
            }
          >
            {t.exercises.newExercise}
          </Button>
        }
      />
      <Table headers={[t.common.name, t.common.category, t.exercises.equipment, t.common.status, t.common.actions]}>
        {(q.data ?? []).map((ex) => (
          <tr key={ex.id}>
            <Td className="text-white">{ex.name}</Td>
            <Td>{ex.category}</Td>
            <Td>{ex.equipment.join(", ")}</Td>
            <Td>
              <Badge>{t.difficulty[ex.difficulty]}</Badge>
            </Td>
            <Td>
              <Button variant="ghost" onClick={() => setEditing(ex)}>
                {t.common.edit}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
      {editing ? (
        <Modal open title={t.exercises.newExercise} onClose={() => setEditing(null)}>
          <Field label={t.common.name}>
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <Field label={t.common.details}>
            <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </Field>
          <Field label={t.common.category}>
            <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
          </Field>
          <Field label={t.exercises.equipment}>
            <Input value={editing.equipment.join(", ")} onChange={(e) => setEditing({ ...editing, equipment: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
          </Field>
          <Button
            onClick={async () => {
              await adminApi.exercises.save(editing);
              toast.success(t.common.saved);
              setEditing(null);
              await q.reload();
            }}
          >
            {t.common.save}
          </Button>
        </Modal>
      ) : null}
    </div>
  );
}

export function CreditsPage() {
  const { t, locale } = useI18n();
  const credits = useAsync(() => adminApi.credits.list(), []);
  const users = useAsync(() => adminApi.users.list(), []);
  const [userId, setUserId] = useState("");
  const [delta, setDelta] = useState(1);
  const [note, setNote] = useState("");
  return (
    <div>
      <PageHeader title={t.credits.title} subtitle={t.credits.subtitle} />
      <div className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-4">
        <Field label={t.credits.user}>
          <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">—</option>
            {(users.data ?? [])
              .filter((u) => u.role === "client")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </Select>
        </Field>
        <Field label={t.credits.delta}>
          <Input type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value))} />
        </Field>
        <Field label={t.common.notes}>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Button
            onClick={async () => {
              if (!userId) return;
              await adminApi.credits.adjust(userId, delta, note || "admin");
              toast.success(t.common.saved);
              setNote("");
              await credits.reload();
            }}
          >
            {t.credits.adjust}
          </Button>
        </div>
      </div>
      <Table headers={[t.credits.user, t.credits.delta, t.credits.reason, t.common.notes, t.common.created]}>
        {(credits.data ?? []).map((c) => (
          <tr key={c.id}>
            <Td>{userName(users.data ?? [], c.userId)}</Td>
            <Td className={c.delta < 0 ? "text-red-300" : "text-emerald-300"}>{c.delta}</Td>
            <Td>{c.reason}</Td>
            <Td>{c.note}</Td>
            <Td>{formatDate(c.createdAt, locale)}</Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
