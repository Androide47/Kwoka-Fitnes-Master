import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, Input, Modal, PageHeader, Table, Td, Textarea } from "@/components/ui";
import { useI18n } from "@/i18n/LanguageContext";
import { adminApi, userName } from "@/lib/api";
import { formatDate, nowIso } from "@/lib/cn";
import { useAsync } from "@/lib/useAsync";
import type { BlogPost, Testimonial } from "@/lib/types";

export function BlogPage() {
  const { t, locale } = useI18n();
  const q = useAsync(() => adminApi.blog.list(), []);
  const users = useAsync(() => adminApi.users.list(), []);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  return (
    <div>
      <PageHeader
        title={t.blog.title}
        subtitle={t.blog.subtitle}
        actions={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                slug: "",
                title: "",
                excerpt: "",
                body: "",
                authorId: users.data?.find((u) => u.role === "trainer")?.id ?? "",
                category: "coaching",
                createdAt: nowIso(),
              })
            }
          >
            {t.blog.newPost}
          </Button>
        }
      />
      <Table headers={[t.common.name, t.blog.slug, t.common.category, t.common.status, t.common.actions]}>
        {(q.data ?? []).map((p) => (
          <tr key={p.id}>
            <Td className="text-white">{p.title}</Td>
            <Td>{p.slug}</Td>
            <Td>{p.category}</Td>
            <Td>
              <Badge tone={p.publishedAt ? "ok" : "warn"}>{p.publishedAt ? t.blog.published : t.blog.draft}</Badge>
            </Td>
            <Td className="space-x-2">
              <Button variant="ghost" onClick={() => setEditing(p)}>
                {t.common.edit}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await adminApi.blog.save({ ...p, publishedAt: p.publishedAt ? undefined : nowIso() });
                  toast.success(t.common.saved);
                  await q.reload();
                }}
              >
                {p.publishedAt ? t.blog.unpublish : t.blog.publish}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
      {editing ? (
        <Modal open title={t.blog.newPost} onClose={() => setEditing(null)}>
          <Field label={t.common.name}>
            <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </Field>
          <Field label={t.blog.slug}>
            <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          </Field>
          <Field label={t.blog.excerpt}>
            <Textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
          </Field>
          <Field label={t.blog.body}>
            <Textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
          </Field>
          <Button
            onClick={async () => {
              await adminApi.blog.save(editing);
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

export function ContentPage() {
  const { t, locale } = useI18n();
  const settingsQ = useAsync(() => adminApi.content.settings(), []);
  const tesQ = useAsync(() => adminApi.content.testimonials(), []);
  const [settings, setSettings] = useState<(typeof settingsQ.data)>(null);
  const current = settings ?? settingsQ.data;
  const [editing, setEditing] = useState<Testimonial | null>(null);

  return (
    <div>
      <PageHeader title={t.content.title} subtitle={t.content.subtitle} />
      {current ? (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-white">{t.content.hero}</h2>
            <Field label={`${t.content.eyebrow} (EN)`}>
              <Input value={current.hero.eyebrow.en} onChange={(e) => setSettings({ ...current, hero: { ...current.hero, eyebrow: { ...current.hero.eyebrow, en: e.target.value } } })} />
            </Field>
            <Field label={`${t.content.eyebrow} (ES)`}>
              <Input value={current.hero.eyebrow.es} onChange={(e) => setSettings({ ...current, hero: { ...current.hero, eyebrow: { ...current.hero.eyebrow, es: e.target.value } } })} />
            </Field>
            <Field label={`${t.content.headline} (EN)`}>
              <Input value={current.hero.title.en} onChange={(e) => setSettings({ ...current, hero: { ...current.hero, title: { ...current.hero.title, en: e.target.value } } })} />
            </Field>
            <Field label={`${t.content.headline} (ES)`}>
              <Input value={current.hero.title.es} onChange={(e) => setSettings({ ...current, hero: { ...current.hero, title: { ...current.hero.title, es: e.target.value } } })} />
            </Field>
            <Field label={`${t.content.subtitleField} (EN)`}>
              <Textarea value={current.hero.subtitle.en} onChange={(e) => setSettings({ ...current, hero: { ...current.hero, subtitle: { ...current.hero.subtitle, en: e.target.value } } })} />
            </Field>
            <Field label={`${t.content.subtitleField} (ES)`}>
              <Textarea value={current.hero.subtitle.es} onChange={(e) => setSettings({ ...current, hero: { ...current.hero, subtitle: { ...current.hero.subtitle, es: e.target.value } } })} />
            </Field>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-white">{t.content.about}</h2>
            <Field label="EN">
              <Textarea value={current.about.en} onChange={(e) => setSettings({ ...current, about: { ...current.about, en: e.target.value } })} />
            </Field>
            <Field label="ES">
              <Textarea value={current.about.es} onChange={(e) => setSettings({ ...current, about: { ...current.about, es: e.target.value } })} />
            </Field>
            <Button
              onClick={async () => {
                await adminApi.content.saveSettings(current);
                toast.success(t.common.saved);
                await settingsQ.reload();
              }}
            >
              {t.common.save}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">{t.common.loading}</p>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-white">{t.content.testimonials}</h2>
        <Button
          onClick={() =>
            setEditing({
              id: "",
              name: "",
              role: "",
              coach: "",
              quote: "",
              result: "",
              goal: "",
              initials: "",
              isActive: true,
            })
          }
        >
          {t.content.newTestimonial}
        </Button>
      </div>
      <Table headers={[t.common.name, t.content.result, t.common.status, t.common.actions]}>
        {(tesQ.data ?? []).map((item) => (
          <tr key={item.id}>
            <Td className="text-white">{item.name}</Td>
            <Td>{item.result}</Td>
            <Td>
              <Badge tone={item.isActive ? "ok" : "muted"}>{item.isActive ? t.common.active : t.common.inactive}</Badge>
            </Td>
            <Td>
              <Button variant="ghost" onClick={() => setEditing(item)}>
                {t.common.edit}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
      {editing ? (
        <Modal open title={t.content.newTestimonial} onClose={() => setEditing(null)}>
          <Field label={t.common.name}>
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <Field label={t.content.quote}>
            <Textarea value={editing.quote} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} />
          </Field>
          <Field label={t.content.result}>
            <Input value={editing.result} onChange={(e) => setEditing({ ...editing, result: e.target.value })} />
          </Field>
          <Field label={t.content.coach}>
            <Input value={editing.coach} onChange={(e) => setEditing({ ...editing, coach: e.target.value })} />
          </Field>
          <Button
            onClick={async () => {
              await adminApi.content.saveTestimonial(editing);
              toast.success(t.common.saved);
              setEditing(null);
              await tesQ.reload();
            }}
          >
            {t.common.save}
          </Button>
        </Modal>
      ) : null}
    </div>
  );
}

export function NewsletterPage() {
  const { t, locale } = useI18n();
  const q = useAsync(() => adminApi.newsletter.list(), []);
  const [email, setEmail] = useState("");
  return (
    <div>
      <PageHeader title={t.newsletterPage.title} subtitle={t.newsletterPage.subtitle} />
      <div className="mb-4 flex max-w-md gap-2">
        <Input placeholder={t.common.email} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          onClick={async () => {
            if (!email) return;
            await adminApi.newsletter.add(email);
            setEmail("");
            toast.success(t.common.saved);
            await q.reload();
          }}
        >
          {t.newsletterPage.add}
        </Button>
      </div>
      <Table headers={[t.common.email, t.common.status, t.common.created, t.common.actions]}>
        {(q.data ?? []).map((n) => (
          <tr key={n.id}>
            <Td>{n.email}</Td>
            <Td>
              <Badge tone={n.isActive ? "ok" : "muted"}>{n.isActive ? t.common.active : t.common.inactive}</Badge>
            </Td>
            <Td>{formatDate(n.createdAt, locale)}</Td>
            <Td>
              <Button
                variant="outline"
                onClick={async () => {
                  await adminApi.newsletter.setActive(n.id, !n.isActive);
                  await q.reload();
                }}
              >
                {n.isActive ? t.users.deactivate : t.users.activate}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
