import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import type { AdSlot } from "@/lib/types";

export function AdSlotDisplay({ placement }: { placement: "sidebar" | "footer" }) {
  const [ad, setAd] = useState<AdSlot | null>(null);

  useEffect(() => {
    void loadAd();
  }, [placement]);

  const loadAd = async () => {
    const { data } = await supabase
      .from("ad_slots")
      .select("*")
      .eq("placement", placement)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setAd(data as AdSlot | null);
  };

  if (!ad) return null;

  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block overflow-hidden rounded-lg border border-border bg-card transition-opacity hover:opacity-90"
    >
      <img src={ad.image_url} alt={ad.advertiser ?? "Διαφήμιση"} className="w-full object-cover" />
      <p className="px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
        Χορηγία
      </p>
    </a>
  );
}