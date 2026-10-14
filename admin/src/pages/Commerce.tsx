import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, Input, Modal, PageHeader, Select, Table, Td, Textarea, statusTone } from "@/components/ui";
import { useI18n } from "@/i18n/LanguageContext";
import { adminApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/cn";
import { useAsync } from "@/lib/useAsync";
import type { OrderStatus, Product, ProductType, Surface } from "@/lib/types";

export function ProductsPage() {
  const { t, locale } = useI18n();
  const q = useAsync(() => adminApi.products.list(), []);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  const rows = useMemo(
    () => (q.data ?? []).filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [q.data, query],
  );

  return (
    <div>
      <PageHeader
        title={t.products.title}
        subtitle={t.products.subtitle}
        actions={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                name: "",
                description: "",
                category: "Memberships",
                type: "subscription",
                priceCents: 0,
                isActive: true,
                surfaces: ["landing"],
              })
            }
          >
            {t.products.newProduct}
          </Button>
        }
      />
      <Input className="mb-4 max-w-xs" placeholder={t.common.search} value={query} onChange={(e) => setQuery(e.target.value)} />
      <Table headers={[t.common.name, t.products.price, t.common.category, t.products.credits, t.products.surfaces, t.common.status, t.common.actions]}>
        {rows.map((p) => (
          <tr key={p.id}>
            <Td className="text-white">{p.name}</Td>
            <Td>{formatMoney(p.priceCents, locale)}</Td>
            <Td>{p.category}</Td>
            <Td>{p.sessionCredits ?? "—"}</Td>
            <Td>{p.surfaces.join(", ")}</Td>
            <Td>
              <Badge tone={p.isActive ? "ok" : "bad"}>{p.isActive ? t.common.active : t.common.inactive}</Badge>
            </Td>
            <Td className="space-x-2">
              <Button variant="ghost" onClick={() => setEditing(p)}>
                {t.common.edit}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  if (!confirm(t.common.confirmDelete)) return;
                  await adminApi.products.remove(p.id);
                  toast.success(t.common.deleted);
                  await q.reload();
                }}
              >
                {t.common.delete}
              </Button>
            </Td>
          </tr>
        ))}
      </Table>
      <ProductModal
        value={editing}
        onClose={() => setEditing(null)}
        onSave={async (product) => {
          await adminApi.products.save(product);
          toast.success(t.common.saved);
          setEditing(null);
          await q.reload();
        }}
      />
    </div>
  );
}

function ProductModal({
  value,
  onClose,
  onSave,
}: {
  value: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState<Product | null>(value);
  if (!value) return null;
  const current = form ?? value;
  const toggleSurface = (s: Surface) => {
    const surfaces = current.surfaces.includes(s)
      ? current.surfaces.filter((x) => x !== s)
      : [...current.surfaces, s];
    setForm({ ...current, surfaces });
  };
  return (
    <Modal open title={value.id ? t.common.edit : t.products.newProduct} onClose={onClose}>
      <Field label={t.common.name}>
        <Input value={current.name} onChange={(e) => setForm({ ...current, name: e.target.value })} />
      </Field>
      <Field label={t.common.details}>
        <Textarea value={current.description} onChange={(e) => setForm({ ...current, description: e.target.value })} />
      </Field>
      <Field label={t.common.category}>
        <Input value={current.category} onChange={(e) => setForm({ ...current, category: e.target.value })} />
      </Field>
      <Field label={t.common.category}>
        <Select value={current.type} onChange={(e) => setForm({ ...current, type: e.target.value as ProductType })}>
          {Object.entries(t.productType).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t.products.price}>
        <Input
          type="number"
          value={current.priceCents / 100}
          onChange={(e) => setForm({ ...current, priceCents: Math.round(Number(e.target.value) * 100) })}
        />
      </Field>
      <Field label={t.products.credits}>
        <Input
          type="number"
          value={current.sessionCredits ?? 0}
          onChange={(e) => setForm({ ...current, sessionCredits: Number(e.target.value) || undefined })}
        />
      </Field>
      <div className="mb-3 flex gap-2">
        <Button variant={current.surfaces.includes("landing") ? "secondary" : "outline"} onClick={() => toggleSurface("landing")}>
          {t.common.landing}
        </Button>
        <Button variant={current.surfaces.includes("mobile") ? "secondary" : "outline"} onClick={() => toggleSurface("mobile")}>
          {t.common.mobile}
        </Button>
      </div>
      <Button onClick={() => onSave(current)}>{t.common.save}</Button>
    </Modal>
  );
}

export function OrdersPage() {
  const { t, locale } = useI18n();
  const q = useAsync(() => adminApi.orders.list(), []);
  return (
    <div>
      <PageHeader title={t.orders.title} subtitle={t.orders.subtitle} />
      <Table headers={[t.orders.customer, t.common.email, t.orders.items, t.orders.total, t.common.status, t.common.created, t.common.actions]}>
        {(q.data ?? []).map((o) => (
          <tr key={o.id}>
            <Td className="text-white">{o.customerName}</Td>
            <Td>{o.email}</Td>
            <Td>{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</Td>
            <Td>{formatMoney(o.totalCents, locale)}</Td>
            <Td>
              <Badge tone={statusTone(o.status)}>{t.orderStatus[o.status]}</Badge>
            </Td>
            <Td>{formatDate(o.createdAt, locale)}</Td>
            <Td>
              <Select
                value={o.status}
                onChange={async (e) => {
                  await adminApi.orders.setStatus(o.id, e.target.value as OrderStatus);
                  toast.success(t.common.saved);
                  await q.reload();
                }}
              >
                {Object.entries(t.orderStatus).map(([k, v]) => (
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
