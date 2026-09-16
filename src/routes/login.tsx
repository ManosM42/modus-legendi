import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function LoginPage() {
  const { session, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  if (session && profile) {
    navigate({ to: "/profile/$username", params: { username: profile.username }, replace: true });
  }
}, [session, profile, navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Something went wrong signing in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-xl border border-border bg-card overflow-hidden">
          {/* Header band */}
          <div className="px-8 pt-10 pb-8 text-center bg-accent">
            <h1 className="font-display text-3xl tracking-[0.08em] text-accent-foreground">
              Modus Legendi
            </h1>
            <p className="mt-2 text-sm text-accent-foreground/80">
              A reading room for reviews, essays &amp; the books that moved
              you.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-10">
            <h2 className="text-xl font-semibold text-center mb-1 text-foreground">
              Sign in to continue
            </h2>
            <p className="text-sm text-center mb-8 text-muted-foreground">
              Join the club. Write, review, and follow your favourite
              readers.
            </p>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-3 rounded-xl border border-border px-4 py-3 font-medium text-foreground bg-background transition-colors hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed",
                focusRing,
              )}
            >
              <GoogleIcon />
              {loading ? "Redirecting to Google…" : "Continue with Google"}
            </button>

            <p className="mt-8 text-xs text-center leading-relaxed text-muted-foreground">
              By continuing you agree to Modus Legendi's Terms and
              acknowledge our Privacy Policy. Only Google sign-in is
              supported — no separate passwords to manage.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Modus Legendi
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 3l6-6C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8.1 3l6-6C34.3 5.1 29.4 3 24 3 16.1 3 9.2 7.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.3 0 10.1-2 13.7-5.3l-6.3-5.3C29.4 36.3 26.8 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.1 40.5 16 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.3 5.3C40.9 36.4 44 30.9 44 24c0-1.4-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}