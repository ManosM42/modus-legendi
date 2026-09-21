import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import { LayoutDashboard, Users, BookOpen, Eye, TrendingUp, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface AdminStatRow {
  stat_name: string;
  stat_value: string;
  description: string;
  stat_order: number;
}

function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      void loadStats();
    }
  }, [authLoading, isAdmin]);

  const loadStats = async () => {
    setLoading(true);
    // order by stat_order (fixed, meaningful sequence), NOT stat_name
    // (alphabetical would scramble "Σύνολο μελών" vs "Συντάκτες" etc.)
    const { data } = await supabase
      .from("admin_stats")
      .select("*")
      .order("stat_order", { ascending: true });
    setStats((data as AdminStatRow[]) ?? []);
    setLoading(false);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Δεν έχεις πρόσβαση σε αυτή τη σελίδα.</p>
          <Link to="/" className="mt-4 inline-block text-xs font-mono uppercase tracking-widest text-accent hover:underline">
            Επιστροφή στην αρχική
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-12 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-bold">
              Control Panel
            </p>
            <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/inbox"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:border-foreground"
            >
              <Mail className="size-3" />
              Inbox
            </Link>
            <Link
              to="/admin/editors"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:border-foreground"
            >
              <Users className="size-3" />
              Διαχείριση Editors
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-card/50" />
            ))}
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-3xl">
            <p className="text-muted-foreground">Δεν υπάρχουν διαθέσιμα στατιστικά.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Τρέξε το sql/003_admin_stats_rows.sql στο Supabase SQL Editor.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.stat_name} delay={i * 60}>
                <TiltCard>
                  <div className="group h-full border border-border bg-card p-8 transition-all duration-300 hover:border-accent shadow-sm hover:shadow-xl rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                        {getIconForStat(stat.stat_name)}
                      </div>
                      <TrendingUp className="size-4 text-muted-foreground/30" />
                    </div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground mb-1">
                      {stat.stat_name}
                    </p>
                    <h3 className="font-display text-4xl font-bold text-accent">
                      {stat.stat_value}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-border">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="text-xs font-mono uppercase tracking-widest">
              © {new Date().getFullYear()} Modus Legendi Administration
            </p>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-xs">
                <span className="size-2 rounded-full bg-green-500" />
                System Online
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function getIconForStat(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("μέλ") || normalized.includes("συντάκτ")) return <Users className="size-5" />;
  if (normalized.includes("άρθρ")) return <BookOpen className="size-5" />;
  if (normalized.includes("μήνυμ")) return <Mail className="size-5" />;
  if (normalized.includes("διαφήμ")) return <TrendingUp className="size-5" />;
  return <LayoutDashboard className="size-5" />;
}