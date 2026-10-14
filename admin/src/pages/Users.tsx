import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, Input, Modal, PageHeader, Select, Table, Td } from "@/components/ui";
import { useI18n } from "@/i18n/LanguageContext";
import { adminApi, userName } from "@/lib/api";
import { formatDate } from "@/lib/cn";
import { useAsync } from "@/lib/useAsync";
import type { User, UserRole } from "@/lib/types";

export function UsersPage() {
  const { t, locale } = useI18n();
  const q = useAsync(() => adminApi.users.list(), []);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [editing, setEditing] = useState<Partial<User> | null>(null);

  const users = useMemo(
    () =>
      (q.data ?? []).filter((u) => {
        const hay = `${u.name} ${u.email}`.toLowerCase();
        return hay.includes(query.toLowerCase()) && (role === "all" || u.role === role);
      }),
    [q.data, query, role],
  );
  const trainers = (q.data ?? []).filter((u) => u.role === "trainer");

  return (
    <div>
      <PageHeader
        title={t.users.title}
        subtitle={t.users.subtitle}
        actions={<Button onClick={() => setEditing({ name: "", email: "", role: "client", isActive: true })}>{t.users.newUser}</Button>}
      />
      <div className="mb-4 flex gap-2">
        <Input className="max-w-xs" placeholder={t.common.search} value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-40">
          <option value="all">{t.common.all}</option>
          {Object.entries(t.roles).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <Table headers={[t.common.name, t.common.email, t.common.role, t.users.trainer, t.common.status, t.common.created, t.common.actions]}>
        {users.map((u) => (
          <tr key={u.id}>
            <Td className="text-white">{u.name}</Td>
            <Td>{u.email}</Td>
            <Td>{t.roles[u.role]}</Td>
            <Td>{userName(q.data ?? [], u.trainerId)}</Td>
            <Td>
              <Badge tone={u.isActive ? "ok" : "bad"}>{u.isActive ? t.common.active : t.common.inactive}</Badge>
            </Td>
            <Td>{formatDate(u.joinedAt, locale)}</Td>
            <Td className="space-x-2">
              <Button variant="ghost" onClick={() => setEditing(u)}>
                {t.common.edit}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await adminApi.users.setActive(u.id, !u.isActive);
                  toast.success(t.common.saved);
                  await q.reload();
                }}
              >
                {u.isActive ? t.users.deactivate : t.users.activate}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>

      <Modal open={!!editing} title={editing?.id ? t.common.edit : t.users.newUser} onClose={() => setEditing(null)}>
        {editing ? (
          <>
            <Field label={t.common.name}>
              <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label={t.common.email}>
              <Input value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </Field>
            <Field label={t.common.role}>
              <Select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })}>
                {Object.entries(t.roles).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            {editing.role === "client" ? (
              <Field label={t.users.trainer}>
                <Select value={editing.trainerId ?? ""} onChange={(e) => setEditing({ ...editing, trainerId: e.target.value || undefined })}>
                  <option value="">{t.users.none}</option>
                  {trainers.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
            <Button
              onClick={async () => {
                await adminApi.users.save({
                  id: editing.id,
                  name: editing.name ?? "",
                  email: editing.email ?? "",
                  role: editing.role ?? "client",
                  trainerId: editing.trainerId,
                  isActive: editing.isActive ?? true,
                });
                toast.success(t.common.saved);
                setEditing(null);
                await q.reload();
              }}
            >
              {t.common.save}
            </Button>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
