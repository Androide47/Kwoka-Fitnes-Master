import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, Input, PageHeader, Select, Table, Td, Textarea, Toggle, statusTone } from "@/components/ui";
import { useI18n } from "@/i18n/LanguageContext";
import { adminApi, userName } from "@/lib/api";
import { formatDate } from "@/lib/cn";
import { useAsync } from "@/lib/useAsync";
import type { Broadcast, FeatureFlags, MediaFile, PlatformSettings } from "@/lib/types";

export function MessagesPage() {
  const { t, locale } = useI18n();
  const q = useAsync(() => adminApi.messages.list(), []);
  const users = useAsync(() => adminApi.users.list(), []);
  return (
    <div>
      <PageHeader title={t.messagesPage.title} subtitle={t.messagesPage.subtitle} />
      <Table headers={[t.messagesPage.sender, t.messagesPage.receiver, t.common.details, t.common.created, t.common.actions]}>
        {(q.data ?? []).map((m) => (
          <tr key={m.id} className={m.flagged ? "bg-red-500/5" : ""}>
            <Td>{userName(users.data ?? [], m.senderId)}</Td>
            <Td>{userName(users.data ?? [], m.receiverId)}</Td>
            <Td className="max-w-sm truncate">{m.content}</Td>
            <Td>{formatDate(m.sentAt, locale)}</Td>
            <Td className="space-x-2">
              <Button
                variant="outline"
                onClick={async () => {
                  await adminApi.messages.setFlagged(m.id, !m.flagged);
                  await q.reload();
                }}
              >
                {m.flagged ? t.messagesPage.unflag : t.messagesPage.flag}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await adminApi.messages.remove(m.id);
                  await q.reload();
                }}
              >
                {t.common.delete}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export function MediaPage() {
  const { t, locale } = useI18n();
  const q = useAsync(() => adminApi.media.list(), []);
  const users = useAsync(() => adminApi.users.list(), []);
  return (
    <div>
      <PageHeader title={t.mediaPage.title} subtitle={t.mediaPage.subtitle} />
      <Table headers={[t.mediaPage.purpose, t.mediaPage.key, t.mediaPage.size, t.mediaPage.owner, t.common.status, t.common.actions]}>
        {(q.data ?? []).map((m) => (
          <tr key={m.id}>
            <Td>{m.purpose}</Td>
            <Td className="font-mono text-xs">{m.s3Key}</Td>
            <Td>{Math.round(m.byteSize / 1024)} KB</Td>
            <Td>{userName(users.data ?? [], m.ownerUserId)}</Td>
            <Td>
              <Badge tone={statusTone(m.status)}>{t.mediaStatus[m.status]}</Badge>
            </Td>
            <Td>
              <Select
                value={m.status}
                onChange={async (e) => {
                  await adminApi.media.setStatus(m.id, e.target.value as MediaFile["status"]);
                  await q.reload();
                }}
              >
                {Object.entries(t.mediaStatus).map(([k, v]) => (
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

export function BroadcastsPage() {
  const { t, locale } = useI18n();
  const q = useAsync(() => adminApi.content.broadcasts(), []);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Broadcast["audience"]>("all");
  return (
    <div>
      <PageHeader title={t.broadcasts.title} subtitle={t.broadcasts.subtitle} />
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <Field label={t.broadcasts.titleField}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t.broadcasts.message}>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <Field label={t.broadcasts.audience}>
          <Select value={audience} onChange={(e) => setAudience(e.target.value as Broadcast["audience"])}>
            {Object.entries(t.broadcasts.audiences).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Button
          onClick={async () => {
            if (!title || !message) return;
            await adminApi.content.sendBroadcast({ title, message, audience });
            setTitle("");
            setMessage("");
            toast.success(t.common.saved);
            await q.reload();
          }}
        >
          {t.broadcasts.send}
        </Button>
      </div>
      <Table headers={[t.broadcasts.titleField, t.broadcasts.audience, t.common.created]}>
        {(q.data ?? []).map((b) => (
          <tr key={b.id}>
            <Td className="text-white">{b.title}</Td>
            <Td>{t.broadcasts.audiences[b.audience]}</Td>
            <Td>{formatDate(b.createdAt, locale)}</Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useI18n();
  const flagsQ = useAsync(() => adminApi.content.flags(), []);
  const settingsQ = useAsync(() => adminApi.content.settings(), []);
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const f = flags ?? flagsQ.data;
  const s = settings ?? settingsQ.data;

  return (
    <div>
      <PageHeader title={t.settings.title} subtitle={t.settings.subtitle} />
      {f ? (
        <div className="mb-8 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-white">{t.settings.flags}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <Toggle checked={f.storeEnabled} onChange={(v) => setFlags({ ...f, storeEnabled: v })} label={t.settings.store} />
            <Toggle checked={f.blogEnabled} onChange={(v) => setFlags({ ...f, blogEnabled: v })} label={t.settings.blogFlag} />
            <Toggle checked={f.bookingsEnabled} onChange={(v) => setFlags({ ...f, bookingsEnabled: v })} label={t.settings.bookingsFlag} />
            <Toggle checked={f.messagingEnabled} onChange={(v) => setFlags({ ...f, messagingEnabled: v })} label={t.settings.messaging} />
            <Toggle checked={f.progressPhotosEnabled} onChange={(v) => setFlags({ ...f, progressPhotosEnabled: v })} label={t.settings.photos} />
            <Toggle checked={f.socialLoginEnabled} onChange={(v) => setFlags({ ...f, socialLoginEnabled: v })} label={t.settings.social} />
            <Toggle checked={f.newsletterEnabled} onChange={(v) => setFlags({ ...f, newsletterEnabled: v })} label={t.settings.newsletterFlag} />
            <Toggle checked={f.contactFormEnabled} onChange={(v) => setFlags({ ...f, contactFormEnabled: v })} label={t.settings.contact} />
            <Toggle checked={f.landingMaintenance} onChange={(v) => setFlags({ ...f, landingMaintenance: v })} label={t.settings.landingMaint} />
            <Toggle checked={f.mobileMaintenance} onChange={(v) => setFlags({ ...f, mobileMaintenance: v })} label={t.settings.mobileMaint} />
            <Toggle checked={f.forceMobileUpdate} onChange={(v) => setFlags({ ...f, forceMobileUpdate: v })} label={t.settings.forceUpdate} />
          </div>
          <Button
            className="mt-4"
            onClick={async () => {
              await adminApi.content.saveFlags(f);
              toast.success(t.common.saved);
            }}
          >
            {t.common.save}
          </Button>
        </div>
      ) : null}
      {s ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-white">{t.settings.identity}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t.settings.supportEmail}>
              <Input value={s.supportEmail} onChange={(e) => setSettings({ ...s, supportEmail: e.target.value })} />
            </Field>
            <Field label={t.settings.helpUrl}>
              <Input value={s.helpUrl} onChange={(e) => setSettings({ ...s, helpUrl: e.target.value })} />
            </Field>
            <Field label={t.settings.ios}>
              <Input value={s.iosAppUrl} onChange={(e) => setSettings({ ...s, iosAppUrl: e.target.value })} />
            </Field>
            <Field label={t.settings.android}>
              <Input value={s.androidAppUrl} onChange={(e) => setSettings({ ...s, androidAppUrl: e.target.value })} />
            </Field>
            <Field label={t.settings.minIos}>
              <Input value={s.minIosVersion} onChange={(e) => setSettings({ ...s, minIosVersion: e.target.value })} />
            </Field>
            <Field label={t.settings.minAndroid}>
              <Input value={s.minAndroidVersion} onChange={(e) => setSettings({ ...s, minAndroidVersion: e.target.value })} />
            </Field>
            <Field label={t.settings.sessionLen}>
              <Input type="number" value={s.sessionLengthMin} onChange={(e) => setSettings({ ...s, sessionLengthMin: Number(e.target.value) })} />
            </Field>
          </div>
          <Button
            className="mt-4"
            onClick={async () => {
              await adminApi.content.saveSettings(s);
              toast.success(t.common.saved);
            }}
          >
            {t.common.save}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
