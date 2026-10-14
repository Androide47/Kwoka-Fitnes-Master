import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, PageHeader } from "@/components/ui";
import { useI18n } from "@/i18n/LanguageContext";
import { adminApi } from "@/lib/api";
import { formatMoney } from "@/lib/cn";
import { useAsync } from "@/lib/useAsync";

export function DashboardPage() {
  const { t, locale } = useI18n();
  const { data, loading } = useAsync(() => adminApi.dashboard(), []);
  if (loading || !data) return <p className="text-muted-foreground">{t.common.loading}</p>;

  const stats = [
    { label: t.dashboard.openTickets, value: data.openTickets },
    { label: t.dashboard.activeUsers, value: data.activeUsers },
    { label: t.dashboard.revenue, value: formatMoney(data.paidRevenue, locale) },
    { label: t.dashboard.pendingBookings, value: data.pendingBookings },
    { label: t.dashboard.orders, value: data.orders },
    { label: t.dashboard.newsletter, value: data.newsletter },
    { label: t.dashboard.flagged, value: data.flaggedMessages },
  ];

  const awsRows = [
    [t.dashboard.api, data.aws.apiGateway],
    [t.dashboard.cognito, data.aws.cognito],
    [t.dashboard.rds, data.aws.rds],
    [t.dashboard.s3, data.aws.s3],
    [t.dashboard.ses, data.aws.ses],
  ] as const;

  return (
    <div>
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-2xl text-white">{s.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-3 text-sm text-muted-foreground">{t.dashboard.revenueChart}</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByDay}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #334155" }} />
                <Bar dataKey="revenue" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <p className="mb-3 text-sm text-muted-foreground">{t.dashboard.awsTitle}</p>
          <ul className="space-y-2">
            {awsRows.map(([label, status]) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <Badge tone={status === "active" ? "ok" : status === "degraded" ? "warn" : "bad"}>
                  {t.awsStatus[status]}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="mt-4">
        <p className="mb-3 text-sm text-muted-foreground">{t.dashboard.recentSupport}</p>
        <ul className="space-y-2">
          {data.recentTickets.map((ticket) => (
            <li key={ticket.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-white">{ticket.subject}</span>
              <Badge tone="warn">{t.ticketStatus[ticket.status]}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
