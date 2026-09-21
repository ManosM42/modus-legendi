import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n";
import { contactDetails } from "@/data/content";
import { supabase } from "@/supabase/client";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/submissions")({
  head: () => ({
    meta: [
      { title: "Υποβολές — MODUS LEGENDI" },
      {
        name: "description",
        content:
          "Οδηγίες και φόρμα υποβολής για δοκίμια, κριτικές βιβλίου και μεταφράσεις στο περιοδικό MODUS LEGENDI.",
      },
      { property: "og:title", content: "Υποβολές — MODUS LEGENDI" },
      { property: "og:description", content: "Οδηγίες υποβολής κειμένων και μεταφράσεων." },
    ],
  }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "essay",
    title: "",
    language: "el",
    abstract: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next["name"] = t.form.required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next["email"] = t.form.invalidEmail;
    if (!form.title.trim()) next["title"] = t.form.required;
    if (form.abstract.trim().length < 20) next["abstract"] = t.form.tooShort;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setServerError(null);
    setSubmitting(true);

    const { error } = await supabase.from("submissions").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      type: form.type,
      title: form.title.trim(),
      language: form.language,
      abstract: form.abstract.trim(),
    });

    setSubmitting(false);

    if (error) {
      setServerError("Κάτι πήγε στραβά. Δοκίμασε ξανά σε λίγο.");
      return;
    }

    setSent(true);
  };

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Ambient accent glow, matches the homepage hero treatment */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-60"
        style={{
          background:
            "radial-gradient(55% 60% at 15% 0%, hsl(var(--accent) / 0.14), transparent 65%), radial-gradient(45% 50% at 100% 10%, hsl(var(--accent) / 0.10), transparent 60%)",
        }}
      />

      <PageHeader kicker={t.brand} title={t.submissions.title} intro={t.submissions.intro} />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <aside>
          <div className="mb-8 flex flex-col gap-4">
            <p className="rule-label flex items-center gap-2 font-bold uppercase tracking-wider text-accent">
              <Sparkles aria-hidden className="size-3.5" />
              Οδηγίες
            </p>
            <h2 className="font-display text-3xl">{t.submissions.guidelinesTitle}</h2>
          </div>
          <div className="border-l-2 border-accent/30 py-2 pl-6">
            <ul className="space-y-6">
              {t.submissions.guidelines.map((item, index) => (
                <Reveal key={item} delay={index * 80}>
                  <li className="text-sm leading-relaxed text-muted-foreground">{item}</li>
                </Reveal>
              ))}
            </ul>
            <div className="mt-10 border-t border-border pt-6">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Email Υποβολών
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {contactDetails.submissionsEmail}
              </p>
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-8 flex flex-col gap-4">
            <p className="rule-label font-bold uppercase tracking-wider text-accent">Φόρμα</p>
            <h2 className="font-display text-3xl">{t.submissions.formTitle}</h2>
          </div>

          <TiltCard>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-2xl transition-shadow duration-300 hover:shadow-accent/10 sm:p-10">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-accent/10 blur-3xl"
              />
              {sent ? (
                <div className="relative flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-6 text-sm text-accent">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span className="font-medium">{t.submissions.success}</span>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="relative grid gap-6 sm:grid-cols-2">
                  <TextField
                    id="sub-name"
                    label={t.submissions.fields.name}
                    value={form.name}
                    error={errors["name"]}
                    onChange={(value) => setForm({ ...form, name: value })}
                  />
                  <TextField
                    id="sub-email"
                    type="email"
                    label={t.submissions.fields.email}
                    value={form.email}
                    error={errors["email"]}
                    onChange={(value) => setForm({ ...form, email: value })}
                  />
                  <div className="space-y-2">
                    <label
                      htmlFor="sub-type"
                      className="text-xs font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      {t.submissions.fields.type}
                    </label>
                    <select
                      id="sub-type"
                      value={form.type}
                      onChange={(event) => setForm({ ...form, type: event.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus-visible:border-accent"
                    >
                      <option value="essay">{t.submissions.types.essay}</option>
                      <option value="review">{t.submissions.types.review}</option>
                      <option value="translation">{t.submissions.types.translation}</option>
                      <option value="interview">{t.submissions.types.interview}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="sub-language"
                      className="text-xs font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      {t.submissions.fields.language}
                    </label>
                    <select
                      id="sub-language"
                      value={form.language}
                      onChange={(event) => setForm({ ...form, language: event.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus-visible:border-accent"
                    >
                      <option value="el">Ελληνικά</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <TextField
                      id="sub-title"
                      label={t.submissions.fields.title}
                      value={form.title}
                      error={errors["title"]}
                      onChange={(value) => setForm({ ...form, title: value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor="sub-abstract"
                      className="text-xs font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      {t.submissions.fields.abstract}
                    </label>
                    <textarea
                      id="sub-abstract"
                      rows={5}
                      value={form.abstract}
                      onChange={(event) => setForm({ ...form, abstract: event.target.value })}
                      aria-invalid={Boolean(errors["abstract"])}
                      aria-describedby={errors["abstract"] ? "sub-abstract-error" : undefined}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus-visible:border-accent"
                    />
                    {errors["abstract"] ? (
                      <p id="sub-abstract-error" className="mt-1 text-xs text-destructive">
                        {errors["abstract"]}
                      </p>
                    ) : null}
                  </div>

                  {serverError && (
                    <p role="alert" className="text-sm text-destructive sm:col-span-2">
                      {serverError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="justify-self-start rounded-lg bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-widest text-background shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60 sm:col-span-2"
                  >
                    {submitting ? "Αποστολή…" : t.actions.submit}
                  </button>
                </form>
              )}
            </div>
          </TiltCard>
        </section>
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  type?: string | undefined;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus-visible:border-accent",
          error && "border-destructive",
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}