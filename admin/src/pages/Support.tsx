import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, Input, Modal, PageHeader, Select, Table, Td, Textarea, statusTone } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/LanguageContext";
import { adminApi, userName } from "@/lib/api";
import { formatDate } from "@/lib/cn";
import { useAsync } from "@/lib/useAsync";
import type { Ticket, TicketCategory, TicketPriority, TicketSource, TicketStatus } from "@/lib/types";

export function SupportPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const ticketsQ = useAsync(() => adminApi.tickets.list(), []);
  const usersQ = useAsync(() => adminApi.users.list(), []);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [reply, setReply] = useState("");

  const tickets = useMemo(() => {
    return (ticketsQ.data ?? []).filter((ticket) => {
      const hay = `${ticket.subject} ${ticket.email} ${ticket.name}`.toLowerCase();
      return hay.includes(query.toLowerCase()) && (status === "all" || ticket.status === status);
    });
  }, [ticketsQ.data, query, status]);

  const refresh = async () => {
    await ticketsQ.reload();
    setSelected((cur) => (cur ? (ticketsQ.data ?? []).find((x) => x.id === cur.id) ?? cur : cur));
  };

  return (
    <div>
      <PageHeader
        title={t.support.title}
        subtitle={t.support.subtitle}
        actions={<Button onClick={() => setCreateOpen(true)}>{t.support.newTicket}</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder={t.common.search} value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="all">{t.common.all}</option>
          {Object.entries(t.ticketStatus).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <Table
        headers={[t.support.subject, t.common.email, t.common.category, t.common.priority, t.common.source, t.common.status, t.common.updated, t.common.actions]}
      >
        {tickets.map((ticket) => (
          <tr key={ticket.id} className="hover:bg-muted/30">
            <Td className="text-white">{ticket.subject}</Td>
            <Td>{ticket.email}</Td>
            <Td>{t.ticketCategory[ticket.category]}</Td>
            <Td>
              <Badge tone={ticket.priority === "urgent" || ticket.priority === "high" ? "bad" : "muted"}>
                {t.ticketPriority[ticket.priority]}
              </Badge>
            </Td>
            <Td>{t.ticketSource[ticket.source]}</Td>
            <Td>
              <Badge tone={statusTone(ticket.status)}>{t.ticketStatus[ticket.status]}</Badge>
            </Td>
            <Td>{formatDate(ticket.updatedAt, locale)}</Td>
            <Td>
              <Button variant="ghost" onClick={() => setSelected(ticket)}>
                {t.common.details}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
      {tickets.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">{t.common.empty}</p> : null}

      <Modal open={!!selected} title={selected?.subject ?? ""} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{selected.details}</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t.common.status}>
                <Select
                  value={selected.status}
                  onChange={async (e) => {
                    await adminApi.tickets.update(selected.id, { status: e.target.value as TicketStatus });
                    toast.success(t.common.saved);
                    await ticketsQ.reload();
                    setSelected({ ...selected, status: e.target.value as TicketStatus });
                  }}
                >
                  {Object.entries(t.ticketStatus).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t.support.assignee}>
                <Select
                  value={selected.assigneeId ?? ""}
                  onChange={async (e) => {
                    await adminApi.tickets.update(selected.id, { assigneeId: e.target.value || undefined });
                    toast.success(t.common.saved);
                    await ticketsQ.reload();
                  }}
                >
                  <option value="">{t.support.unassigned}</option>
                  {(usersQ.data ?? [])
                    .filter((u) => u.role === "admin" || u.role === "trainer")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </Select>
              </Field>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase text-muted-foreground">{t.support.conversation}</p>
              <div className="space-y-2">
                {selected.replies.map((r) => (
                  <div key={r.id} className="rounded-md bg-muted/40 p-2 text-sm">
                    <p className="text-xs text-muted-foreground">
                      {r.author} · {formatDate(r.createdAt, locale)} {r.internal ? `· ${t.support.internalNote}` : ""}
                    </p>
                    <p>{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <Textarea value={reply} onChange={(e) => setReply(e.target.value)} />
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!reply.trim() || !user) return;
                  await adminApi.tickets.reply(selected.id, user.name, reply, false);
                  setReply("");
                  toast.success(t.common.saved);
                  await refresh();
                }}
              >
                {t.support.sendReply}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!reply.trim() || !user) return;
                  await adminApi.tickets.reply(selected.id, user.name, reply, true);
                  setReply("");
                  toast.success(t.common.saved);
                  await refresh();
                }}
              >
                {t.support.addNote}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <CreateTicket
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          await ticketsQ.reload();
        }}
      />
    </div>
  );
}

function CreateTicket({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState<TicketCategory>("app");
  const [source, setSource] = useState<TicketSource>("admin");
  const [priority, setPriority] = useState<TicketPriority>("medium");

  return (
    <Modal open={open} title={t.support.newTicket} onClose={onClose}>
      <Field label={t.common.name}>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label={t.common.email}>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label={t.support.subject}>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Field>
      <Field label={t.common.category}>
        <Select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)}>
          {Object.entries(t.ticketCategory).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.common.source}>
        <Select value={source} onChange={(e) => setSource(e.target.value as TicketSource)}>
          {Object.entries(t.ticketSource).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.common.priority}>
        <Select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
          {Object.entries(t.ticketPriority).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.common.details}>
        <Textarea value={details} onChange={(e) => setDetails(e.target.value)} />
      </Field>
      <Button
        onClick={async () => {
          await adminApi.tickets.create({
            email,
            name,
            subject,
            category,
            source,
            status: "open",
            priority,
            details,
          });
          toast.success(t.common.saved);
          onCreated();
        }}
      >
        {t.common.create}
      </Button>
    </Modal>
  );
}
