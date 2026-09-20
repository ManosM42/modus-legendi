// src/components/site/IntroLoader.tsx
//
// A single, orchestrated page-load moment shown once per browser session
// before the site appears. Built entirely from the logo's own motifs (the
// arc, the hairline divider) reused across the sequence rather than a
// checklist of unrelated effects — draw the arc, resolve the mark inside
// it, cascade the wordmark, read out a hairline progress rule, then close
// back down to the same arc, like a book cover closing.
//
// Usage (see root.tsx):
//   <IntroLoader />
//   <div className="flex min-h-dvh flex-col"> ...site... </div>
//
// The loader is `position: fixed`, so it can be mounted as a sibling
// right before your normal layout — it doesn't need to wrap anything.

import { useEffect, useRef, useState } from "react";
import logo from "@/assets/modus-logo.jpg";

const SESSION_KEY = "ml-intro-seen";
// Fixed durations — deliberately NOT tied to real page-load time. The
// intro is a brand moment, not a network progress indicator, so it always
// runs its full length regardless of how fast the site itself is ready.
const SEQUENCE_MS = 5400; // time before the close begins
const CLOSE_MS = 1000; // close animation duration

export function IntroLoader() {
  // SSR always renders the loader in its initial "entering" state so the
  // first paint matches between server and client — the decision to skip
  // it (already seen this session, or reduced motion) happens client-side
  // in an effect, never during render.
  const [phase, setPhase] = useState<"entering" | "holding" | "closing" | "done">("entering");
  const [reduced, setReduced] = useState(false);
  const [percent, setPercent] = useState(0);
  const skippedRef = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const url = new URL(window.location.href);
    const forceReplay = url.searchParams.get("intro") === "1";
    // In dev, always play — otherwise every hot-reload/second visit during
    // testing looks like "it doesn't work" when it's really just skipping.
    const alreadySeen =
      !import.meta.env.DEV && !forceReplay && sessionStorage.getItem(SESSION_KEY) === "1";

    if (alreadySeen) {
      skippedRef.current = true;
      setPhase("done");
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "1");

    if (prefersReduced) {
      setReduced(true);
      const t = setTimeout(() => setPhase("closing"), 500);
      const t2 = setTimeout(() => setPhase("done"), 500 + 400);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }

    setPhase("holding");
    const closeTimer = setTimeout(() => setPhase("closing"), SEQUENCE_MS);
    const doneTimer = setTimeout(() => setPhase("done"), SEQUENCE_MS + CLOSE_MS);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  // Counter ticks alongside the hairline progress rule, not tied to real
  // network activity — a paced editorial beat, not a claim of "loading files".
  // Starts once the progress row has actually faded in (3.9s) and finishes
  // with a beat to spare before the close begins, so the count is visibly
  // moving the whole time it's on screen instead of appearing pre-filled.
  useEffect(() => {
    if (phase !== "holding" || reduced) return;
    const visibleAt = 3900;
    const duration = SEQUENCE_MS - visibleAt - 300;
    let raf: number;
    const startTimer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setPercent(Math.round(t * 100));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, visibleAt);
    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
  }, [phase, reduced]);

  useEffect(() => {
    if (phase === "entering" || phase === "done") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden={phase === "closing"}
      role="status"
      aria-live="polite"
      aria-label="Modus Legendi — φόρτωση"
      className={`ml-intro ml-intro--${phase}${reduced ? " ml-intro--reduced" : ""}`}
    >
      <div className="ml-intro__grain" />

      <div className="ml-intro__stage">
        <svg
          className="ml-intro__arc"
          viewBox="0 0 220 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="110"
            cy="120"
            r="92"
            stroke="#2F4368"
            strokeWidth="1.2"
            strokeLinecap="round"
            pathLength={100}
            className="ml-intro__arc-path"
          />
        </svg>

        <div className="ml-intro__mark-crop">
          <img src={logo} alt="" className="ml-intro__mark-img" />
        </div>

        <div className="ml-intro__wordmark">
          <span className="ml-intro__word ml-intro__word--a">MODUS</span>
          <span className="ml-intro__rule" />
          <span className="ml-intro__word ml-intro__word--b">LEGENDI</span>
        </div>

        <p className="ml-intro__tagline">
          Ένας χώρος για τη λογοτεχνία,
          <br />
          την ανάγνωση και τη σκέψη.
        </p>

        <div className="ml-intro__progress">
          <span className="ml-intro__progress-track">
            <span
              className="ml-intro__progress-fill"
              style={{ width: reduced ? "100%" : `${percent}%` }}
            />
          </span>
          <span className="ml-intro__progress-count">{String(percent).padStart(3, "0")}</span>
        </div>
      </div>

      <style>{`
        .ml-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F7F2E7;
          overflow: hidden;
        }
        .ml-intro__grain {
          position: absolute;
          inset: -20%;
          opacity: 0.045;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .ml-intro::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 42%, rgba(47,67,104,0.06), transparent 60%);
          pointer-events: none;
        }

        .ml-intro__stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: min(90vw, 420px);
          transform: scale(1);
          opacity: 1;
          transition: opacity ${CLOSE_MS}ms cubic-bezier(0.65, 0, 0.35, 1),
            transform ${CLOSE_MS}ms cubic-bezier(0.65, 0, 0.35, 1);
        }

        .ml-intro__arc {
          position: absolute;
          top: -46px;
          width: 280px;
          height: 280px;
          opacity: 0.9;
        }
        .ml-intro__arc-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: ml-arc-draw 1.7s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
        }

        .ml-intro__mark-crop {
          position: relative;
          width: 168px;
          height: 148px;
          overflow: hidden;
          clip-path: circle(0% at 50% 55%);
          animation: ml-mark-reveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) 1.3s forwards;
        }
        .ml-intro__mark-img {
          position: absolute;
          top: 0;
          left: 50%;
          width: 340px;
          max-width: none;
          transform: translateX(-50%) translateY(-6%) scale(1.02);
          opacity: 0;
          animation: ml-mark-fade 1.35s ease-out 1.3s forwards;
        }

        .ml-intro__wordmark {
          margin-top: 22px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: "Cormorant Garamond", serif;
          font-weight: 600;
          font-size: clamp(1.9rem, 6vw, 2.6rem);
          letter-spacing: 0.08em;
          color: #2F4368;
        }
        .ml-intro__word {
          opacity: 0;
          transform: translateY(10px);
          filter: blur(2px);
        }
        .ml-intro__word--a {
          animation: ml-word-in 1s cubic-bezier(0.22, 1, 0.36, 1) 2.4s forwards;
        }
        .ml-intro__word--b {
          animation: ml-word-in 1s cubic-bezier(0.22, 1, 0.36, 1) 2.85s forwards;
        }
        .ml-intro__rule {
          display: inline-block;
          width: 0;
          height: 1px;
          background: #2F4368;
          opacity: 0.6;
          animation: ml-rule-draw 0.7s ease-out 3.15s forwards;
        }

        .ml-intro__tagline {
          margin: 20px 0 0;
          text-align: center;
          font-family: "Karla", sans-serif;
          font-style: italic;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #2A211D;
          opacity: 0;
          animation: ml-fade-up 1s ease-out 3.55s forwards;
        }

        .ml-intro__progress {
          margin-top: 36px;
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0;
          animation: ml-fade-up 0.8s ease-out 3.9s forwards;
        }
        .ml-intro__progress-track {
          width: 120px;
          height: 1px;
          background: rgba(47, 67, 104, 0.18);
          display: block;
          position: relative;
        }
        .ml-intro__progress-fill {
          position: absolute;
          inset: 0;
          background: #2F4368;
          width: 0%;
          transition: width 0.1s linear;
        }
        .ml-intro__progress-count {
          font-family: "IBM Plex Mono", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          color: #2F4368;
          min-width: 2.4em;
        }

        .ml-intro--closing .ml-intro__stage {
          opacity: 0;
          transform: scale(0.96);
        }
        .ml-intro--closing .ml-intro__arc {
          animation: ml-arc-close ${CLOSE_MS}ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }

        .ml-intro--reduced .ml-intro__arc-path,
        .ml-intro--reduced .ml-intro__mark-crop,
        .ml-intro--reduced .ml-intro__mark-img,
        .ml-intro--reduced .ml-intro__word,
        .ml-intro--reduced .ml-intro__rule,
        .ml-intro--reduced .ml-intro__tagline,
        .ml-intro--reduced .ml-intro__progress {
          animation: none !important;
          opacity: 1 !important;
          filter: none !important;
          transform: none !important;
          clip-path: circle(75% at 50% 55%) !important;
          stroke-dashoffset: 0 !important;
        }
        .ml-intro--reduced .ml-intro__rule {
          width: 32px !important;
        }
        .ml-intro--reduced.ml-intro--closing .ml-intro__stage {
          transition: opacity 350ms ease;
          opacity: 0;
          transform: none;
        }

        @keyframes ml-arc-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ml-arc-close {
          to { opacity: 0; transform: scale(0.7); }
        }
        @keyframes ml-mark-reveal {
          to { clip-path: circle(75% at 50% 55%); }
        }
        @keyframes ml-mark-fade {
          to { opacity: 1; transform: translateX(-50%) translateY(-6%) scale(1); }
        }
        @keyframes ml-word-in {
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes ml-rule-draw {
          to { width: 32px; }
        }
        @keyframes ml-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 420px) {
          .ml-intro__mark-crop { width: 140px; height: 124px; }
          .ml-intro__mark-img { width: 284px; }
          .ml-intro__arc { width: 236px; height: 236px; top: -38px; }
        }
      `}</style>
    </div>
  );
}