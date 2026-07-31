import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function PolicyPage({
  eyebrow,
  title,
  banner,
  children,
}: {
  eyebrow: string;
  title: string;
  banner?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {banner && (
        <div className="h-56 w-full overflow-hidden border-b-2 border-foreground sm:h-72">
          <img src={banner} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        </div>
      )}
      <main className="mx-auto max-w-3xl px-5 py-14">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 text-5xl">{title}</h1>
        <div className="prose-page mt-8 space-y-6 leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
