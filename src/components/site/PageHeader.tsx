import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PageHeader({
  kicker,
  title,
  intro,
  children,
}: {
  kicker?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-secondary/40 paper-grain">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <Reveal>
          {kicker ? <p className="rule-label">{kicker}</p> : null}
          <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {intro}
            </p>
          ) : null}
          {children ? <div className="mt-7">{children}</div> : null}
        </Reveal>
      </div>
    </header>
  );
}
