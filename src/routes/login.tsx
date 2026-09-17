import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import modusLogo from "@/assets/modus-logo.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Σύνδεση — MODUS LEGENDI" },
      {
        name: "description",
        content: "Συνδέσου για να αποκτήσεις πρόσβαση στα κείμενα της λέσχης Modus Legendi.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 group">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Επιστροφή στην αρχική
        </Link>

        <div className="space-y-8">
          <div className="flex flex-col items-center">
            <img src={modusLogo} alt="Modus Legendi" className="h-16 w-auto mb-6" />
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">
              Καλώς ήρθες
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Συνδέσου με τον λογαριασμό σου στο Google για να αποκτήσεις πρόσβαση στην ψηφιακή βιβλιοθήκη και τα τελευταία κείμενα της ομάδας μας.
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-4 font-medium text-foreground transition-all hover:bg-secondary disabled:opacity-60 shadow-sm"
          >
            <GoogleIcon />
            {loading ? "Μεταφορά στο Google…" : "Συνέχεια με Google"}
          </button>

          <p className="text-xs text-center text-muted-foreground opacity-60">
            Δεν έχεις πρόσβαση; Επικοινώνησε μαζί μας για να μάθεις περισσότερα για τη λέσχη.
          </p>
        </div>
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
