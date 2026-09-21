import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/supabase/client";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/site/PageHeader";
import { TiltCard } from "@/components/site/TiltCard";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [wantsToSubmitText, setWantsToSubmitText] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      message,
      wants_to_submit_text: wantsToSubmitText,
    });

    if (error) {
      setStatus("error");
      return;
    }

    try {
      await supabase.functions.invoke("notify-contact-submission", {
        body: { name, email, message, wantsToSubmitText },
      });
    } catch {
      // swallow
    }

    setStatus("sent");
    setName("");
    setEmail("");
    setMessage("");
    setWantsToSubmitText(false);
  };

  if (status === "sent") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(45% 55% at 50% 30%, hsl(var(--accent) / 0.14), transparent 65%)",
          }}
        />
        <TiltCard>
          <div className="max-w-md rounded-2xl border border-border bg-card p-12 text-center shadow-2xl">
            <h1 className="font-display text-4xl text-foreground">Ευχαριστούμε!</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Λάβαμε το μήνυμά σου και θα επικοινωνήσουμε σύντομα.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className={cn(
                "mt-8 inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary",
                focusRing,
              )}
            >
              Στείλε άλλο μήνυμα
            </button>
          </div>
        </TiltCard>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-60"
        style={{
          background:
            "radial-gradient(55% 60% at 85% 0%, hsl(var(--accent) / 0.14), transparent 65%), radial-gradient(45% 50% at 5% 15%, hsl(var(--accent) / 0.10), transparent 60%)",
        }}
      />

      <PageHeader
        kicker="Επικοινωνία"
        title="Μίλησέ μας"
        intro="Θες να μοιραστείς κάτι μαζί μας, ή να μας στείλεις ένα κείμενο για να το δούμε; Δεν χρειάζεται λογαριασμός — απλά συμπλήρωσε τη φόρμα."
      />

      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <TiltCard>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-2xl transition-shadow duration-300 hover:shadow-accent/10 sm:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-accent/10 blur-3xl"
            />
            <form onSubmit={handleSubmit} className="relative space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Όνομα
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(
                      "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors focus:border-accent",
                      focusRing,
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors focus:border-accent",
                      focusRing,
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Μήνυμα
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(
                    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors focus:border-accent",
                    focusRing,
                  )}
                />
              </div>
              <label className="group flex cursor-pointer items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={wantsToSubmitText}
                  onChange={(e) => setWantsToSubmitText(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border accent-accent"
                />
                <span className="leading-relaxed transition-colors group-hover:text-accent">
                  Θέλω να στείλω κείμενο προς δημοσίευση (δεν χρειάζεται να είμαι
                  μέλος της ομάδας)
                </span>
              </label>
              {status === "error" && (
                <p role="alert" className="text-sm text-destructive">
                  Κάτι πήγε στραβά. Δοκίμασε ξανά σε λίγο.
                </p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className={cn(
                  "w-full rounded-lg bg-foreground px-4 py-4 text-sm font-bold uppercase tracking-widest text-background shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60",
                  focusRing,
                )}
              >
                {status === "sending" ? "Αποστολή…" : "Αποστολή μηνύματος"}
              </button>
            </form>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}