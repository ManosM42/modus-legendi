// src/components/site/IntroLoader.tsx
//
// Cinematic intro: οι γραμμές του λογοτύπου "γράφονται" εκ του μηδενός σαν
// φιδάκι (stroke-dashoffset), πρώτα το βιβλίο, μετά η χρυσή αψίδα, και στο
// τέλος αποκαλύπτεται η γραμματοσειρά "modus legendi" (από το ίδιο το αρχείο
// του λογοτύπου, ώστε τα γράμματα να είναι ΑΚΡΙΒΩΣ ίδια).
//
// Usage (root.tsx):
//   <IntroLoader />
//   <div className="flex min-h-dvh flex-col"> ...site... </div>

import { useEffect, useState } from "react";
import logo from "@/assets/modus-logo.jpg";

const SESSION_KEY = "ml-intro-seen";
const SEQUENCE_MS = 6600; // πριν ξεκινήσει το κλείσιμο
const CLOSE_MS = 900;

const NAVY = "#1B2B48";
const GOLD = "#C39A58";
const BG = "#F9F6F1"; // ίδιο με το φόντο του logo.jpg

// Συντεταγμένες πάνω στο αρχικό logo (1254 x 1254)
const PATHS = {
  outerLeft: "M421 466 L401 456 V657 L609 734 V742",
  outerRight: "M833 466 L853 456 V653 L645 734 V742",
  innerLeft: "M577 665 V510 L445 428 V626 L627 718",
  innerRight: "M627 718 L806 626 V428 L782 438",
  innerSmall: "M677 665 V512 L716 486",
  arch: "M503 432 A124 124 0 0 1 750 451 V635",
};

export function IntroLoader() {
  const [phase, setPhase] = useState<"entering" | "holding" | "closing" | "done">("entering");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const url = new URL(window.location.href);
    const forceReplay = url.searchParams.get("intro") === "1";
    const alreadySeen =
      !import.meta.env.DEV && !forceReplay && sessionStorage.getItem(SESSION_KEY) === "1";

    if (alreadySeen) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");

    if (prefersReduced) {
      setReduced(true);
      const t = setTimeout(() => setPhase("closing"), 600);
      const t2 = setTimeout(() => setPhase("done"), 600 + 400);
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

  useEffect(() => {
    if (phase === "entering" || phase === "done") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "done") return null;

  const VIEWBOX = "170 300 914 620";

  const line = (d: string, cls: string, color = NAVY, width = 4.6) => (
    <path
      d={d}
      className={`ml-intro__line ${cls}`}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      fill="none"
      pathLength={1}
    />
  );

  return (
    <div
      aria-hidden={phase === "closing"}
      role="status"
      aria-live="polite"
      aria-label="Modus Legendi — φόρτωση"
      className={`ml-intro ml-intro--${phase}${reduced ? " ml-intro--reduced" : ""}`}
    >
      <div className="ml-intro__stage">
        {/* 1. Οι γραμμές του λογοτύπου, σχεδιάζονται σαν φιδάκι */}
        <svg className="ml-intro__svg" viewBox={VIEWBOX} xmlns="http://www.w3.org/2000/svg">
          {line(PATHS.outerLeft, "ml-l1")}
          {line(PATHS.outerRight, "ml-l2")}
          {line(PATHS.innerLeft, "ml-l3")}
          {line(PATHS.innerRight, "ml-l4")}
          {line(PATHS.innerSmall, "ml-l5")}
          {line(PATHS.arch, "ml-l6", GOLD, 5)}
        </svg>

        {/* 2. Τα γράμματα: κομμένα από το ίδιο το logo, αποκαλύπτονται αριστερά → δεξιά */}
        <div className="ml-intro__text">
          <svg className="ml-intro__svg" viewBox={VIEWBOX} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="ml-text-clip">
                <rect x="170" y="772" width="914" height="140" />
              </clipPath>
            </defs>
            <g clipPath="url(#ml-text-clip)">
              <image href={logo} x="0" y="0" width="1254" height="1254" />
            </g>
          </svg>
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
          background: ${BG};
          overflow: hidden;
        }
        .ml-intro__stage {
          position: relative;
          width: min(90vw, 760px);
          aspect-ratio: 914 / 620;
          opacity: 1;
          transform: scale(1);
          transition: opacity ${CLOSE_MS}ms cubic-bezier(0.65, 0, 0.35, 1),
            transform ${CLOSE_MS}ms cubic-bezier(0.65, 0, 0.35, 1);
        }
        .ml-intro__svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }

        /* Φιδάκι: κάθε γραμμή ξεκινά από μηδενικό μήκος και ξεδιπλώνεται */
        .ml-intro__line {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation-name: ml-draw;
          animation-timing-function: cubic-bezier(0.55, 0.05, 0.25, 1);
          animation-fill-mode: forwards;
        }
        .ml-l1 { animation-duration: 1.7s; animation-delay: 0.3s; }
        .ml-l2 { animation-duration: 1.7s; animation-delay: 0.3s; }
        .ml-l3 { animation-duration: 1.8s; animation-delay: 0.9s; }
        .ml-l4 { animation-duration: 1.8s; animation-delay: 1.2s; }
        .ml-l5 { animation-duration: 1.1s; animation-delay: 1.9s; }
        .ml-l6 { animation-duration: 2s;   animation-delay: 2.2s; }

        /* Τα γράμματα: αποκάλυψη σαν να γράφονται, με απαλό μπλέντ στο φόντο */
        .ml-intro__text {
          position: absolute;
          inset: 0;
          mix-blend-mode: multiply;
          clip-path: inset(0 100% 0 0);
          animation: ml-text-reveal 2.2s cubic-bezier(0.45, 0.05, 0.2, 1) 4.0s forwards;
        }

        .ml-intro--closing .ml-intro__stage {
          opacity: 0;
          transform: scale(0.97);
        }

        .ml-intro--reduced .ml-intro__line {
          animation: none !important;
          stroke-dashoffset: 0 !important;
        }
        .ml-intro--reduced .ml-intro__text {
          animation: none !important;
          clip-path: inset(0 0 0 0) !important;
        }
        .ml-intro--reduced.ml-intro--closing .ml-intro__stage {
          transition: opacity 350ms ease;
          transform: none;
        }

        @keyframes ml-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ml-text-reveal {
          to { clip-path: inset(0 0 0 0); }
        }
      `}</style>
    </div>
  );
}