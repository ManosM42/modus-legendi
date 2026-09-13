import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useI18n } from "@/i18n";
import { currentBook, formatDate, meetings, pastReads } from "@/data/content";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/reading-group")({
  head: () => ({
    meta: [
      { title: "Λέσχη ανάγνωσης — MODUS LEGENDI" },
      {
        name: "description",
        content:
          "Δύο συναντήσεις τον μήνα, ένα βιβλίο κάθε φορά, κοινές σημειώσεις και ανοιχτή συζήτηση στην Αθήνα και διαδικτυακά.",
      },
      { property: "og:title", content: "Λέσχη ανάγνωσης — MODUS LEGENDI" },
      {
        property: "og:description",
        content: "Ημερολόγιο συναντήσεων, το βιβλίο του μήνα και δηλώσεις συμμετοχής.",
      },
    ],
  }),
  component: ReadingGroupPage,
});

function ReadingGroupPage() {
  const { locale, t } = useI18n();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next['name'] = t.form.required;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next['email'] = t.form.invalidEmail;
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  return (
    <div>
      <PageHeader kicker={t.brand} title={t.group.title} intro={t.group.intro} />

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="text-3xl sm:text-4xl">{t.group.howTitle}</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.group.how.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <li className="h-full border border-border bg-card p-6">
                <span className="rule-label text-accent">0{index + 1}</span>
                <h3 className="mt-3 text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
          <div className="border border-border bg-card p-6 sm:p-8">
            <p className="rule-label">{t.home.currentRead}</p>
            <h2 className="mt-3 text-3xl leading-tight">{currentBook.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentBook.author} · {currentBook.pages} p.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {currentBook.description[locale]}
            </p>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl">{t.group.calendar}</h2>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {meetings.map((meeting) => (
                <li
                  key={meeting.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-5"
                >
                  <div className="min-w-0">
                    <p className="rule-label">
                      {formatDate(meeting.date, locale)} · {meeting.time}
                    </p>
                    <h3 className="mt-1 text-xl leading-snug">{meeting.book}</h3>
                    <p className="text-sm text-muted-foreground">{meeting.bookAuthor}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{meeting.focus[locale]}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{meeting.place[locale]}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="rule-label block text-accent">{t.group[meeting.mode]}</span>
                    <span className="mt-2 block text-sm text-muted-foreground">
                      {meeting.seatsLeft === 0
                        ? t.group.full
                        : `${meeting.seatsLeft} ${t.group.seats}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="text-3xl sm:text-4xl">{t.group.past}</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pastReads.map((book) => (
            <li key={book.title} className="border border-border bg-card p-5">
              <span className="rule-label">{book.year}</span>
              <h3 className="mt-2 text-xl leading-snug">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
              <p className="mt-2 text-sm text-muted-foreground">{book.note[locale]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl sm:text-4xl">{t.group.joinTitle}</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t.group.joinText}
            </p>
          </div>
          {sent ? (
            <p className="flex items-start gap-3 self-start border border-accent/40 bg-accent/10 p-5 text-sm text-accent">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{t.contact.success}</span>
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4">
              <Field
                id="join-name"
                label={t.submissions.fields.name}
                value={form.name}
                error={errors['name']}
                onChange={(value) => setForm({ ...form, name: value })}
              />
              <Field
                id="join-email"
                type="email"
                label={t.submissions.fields.email}
                value={form.email}
                error={errors['email']}
                onChange={(value) => setForm({ ...form, email: value })}
              />
              <div>
                <label htmlFor="join-message" className="rule-label">
                  {t.submissions.fields.message}
                </label>
                <textarea
                  id="join-message"
                  rows={4}
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm outline-none focus-visible:border-accent"
                />
              </div>
              <button
                type="submit"
                className="justify-self-start bg-foreground px-5 py-3 text-sm tracking-wide text-background transition-opacity hover:opacity-90"
              >
                {t.actions.join}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
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
