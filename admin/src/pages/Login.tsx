import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Card, Field, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n/LanguageContext";
import { DEMO_ADMIN } from "@/lib/api";

export function LoginPage() {
  const { t, locale, setLocale } = useI18n();
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_ADMIN.email);
  const [password, setPassword] = useState(DEMO_ADMIN.password);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      toast.error(t.auth.invalid);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_45%)]" />
      <Card className="relative w-full max-w-md p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-display text-xs tracking-[0.28em] text-primary">KWOKA</p>
            <h1 className="mt-2 text-2xl text-white">{t.auth.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.auth.subtitle}</p>
          </div>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "en" | "es")}
            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label={t.auth.email}>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label={t.auth.password}>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Button className="w-full" disabled={busy}>
            {t.auth.login}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t.auth.demoHint}</p>
        </form>
      </Card>
    </div>
  );
}
