import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/i18n";
import { contactDetails } from "@/data/content";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Επικοινωνία — MODUS LEGENDI" },
      {
        name: "description",
        content:
          "Επικοινωνήστε με τη σύνταξη του MODUS LEGENDI για συνεργασίες, εκδηλώσεις και ερωτήματα για τη λέσχη ανάγνωσης.",
      },
      { property: "og:title", content: "Επικοινωνία — MODUS LEGENDI" },
      { property: "og:description", content: "Στοιχεία επικοινωνίας και φόρμα μηνύματος." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { locale, t } = useI18n();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next['name'] = t.form.required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next['email'] = t.form.invalidEmail;
    if (form.message.trim().length < 10) next['message'] = t.form.tooShort;
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  return (
    <div>
      <PageHeader kicker={t.brand} title={t.contact.title} intro={t.contact.intro} />

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <aside>
          <h2 className="text-3xl">{t.contact.infoTitle}</h2>
          <ul className="mt-6 space-y-4 border-t border-border pt-6 text-sm">
            <li className="flex items-start gap-3">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              <span className="min-w-0 break-words">{contactDetails.email}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              <span className="min-w-0">{contactDetails.phone}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
              <span className="min-w-0">{contactDetails.address[locale]}</span>
            </li>
          </ul>
          <div className="mt-8 border-t border-border pt-6">
            <p className="rule-label">{t.contact.hours}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t.contact.hoursValue}</p>
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <p className="rule-label">{t.contact.followTitle}</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {contactDetails.social.map((item) => (
                <li key={item.label}>
                  {item.label} · {item.handle}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section>
          {sent ? (
            <p className="flex items-start gap-3 border border-accent/40 bg-accent/10 p-5 text-sm text-accent">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{t.contact.success}</span>
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
              <ContactField
                id="contact-name"
                label={t.submissions.fields.name}
                value={form.name}
                error={errors['name']}
                onChange={(value) => setForm({ ...form, name: value })}
              />
              <ContactField
                id="contact-email"
                type="email"
                label={t.submissions.fields.email}
                value={form.email}
                error={errors['email']}
                onChange={(value) => setForm({ ...form, email: value })}
              />
              <div className="sm:col-span-2">
                <ContactField
                  id="contact-subject"
                  label={t.submissions.fields.subject}
                  value={form.subject}
                  onChange={(value) => setForm({ ...form, subject: value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contact-message" className="rule-label">
                  {t.submissions.fields.message}
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  aria-invalid={Boolean(errors['message'])}
                  aria-describedby={errors['message'] ? "contact-message-error" : undefined}
                  className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-accent"
                />
                {errors['message'] ? (
                  <p id="contact-message-error" className="mt-1 text-xs text-destructive">
                    {errors['message']}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                className="justify-self-start bg-foreground px-5 py-3 text-sm tracking-wide text-background transition-opacity hover:opacity-90 sm:col-span-2"
              >
                {t.actions.send}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function ContactField({
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
    <div>
      <label htmlFor={id} className="rule-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-accent"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
