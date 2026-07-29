import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listPublishedPrints } from "@/lib/prints.functions";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const printsQuery = queryOptions({
  queryKey: ["prints", "published"],
  queryFn: () => listPublishedPrints(),
});

function priceLabel(print: { price: number; sizes: { label: string; price: number }[] }) {
  if (print.sizes.length > 0) {
    const min = Math.min(...print.sizes.map((s) => s.price));
    return `From £${min.toFixed(2)}`;
  }
  return `£${print.price.toFixed(2)}`;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Didar.Press — Wall Posters, Printed to Order" },
      {
        name: "description",
        content:
          "Browse wall posters in A4, A3, A2 and more. Order and pay directly via WhatsApp.",
      },
      { property: "og:title", content: "Didar.Press — Wall Posters, Printed to Order" },
      {
        property: "og:description",
        content: "Wall posters in multiple sizes, printed to order. Order via WhatsApp.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(printsQuery);
  },
  component: Index,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground" role="alert">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Nothing here.</div>,
});

function Index() {
  const { data: prints } = useSuspenseQuery(printsQuery);
  const [category, setCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(prints.map((p) => p.category)))];
  const visible = category === "All" ? prints : prints.filter((p) => p.category === category);
  const hero = prints.find((p) => p.featured) ?? prints[0];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5">
        <section className="grid gap-10 border-b border-border py-14 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Posters printed to order
            </p>
            <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl">
              Wall posters
              <br />
              <em className="text-primary">made to fit your space.</em>
            </h1>
            <p className="mt-5 max-w-md text-muted-foreground">
              A4, A3, A2 and larger — printed on request and delivered locally. Message us on
              WhatsApp to order and pay, no account needed.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <a href="#catalogue">Browse the posters</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link to="/auth">Studio login</Link>
              </Button>
            </div>
          </div>

          {hero && (
            <Link
              to="/prints/$slug"
              params={{ slug: hero.slug }}
              className="group relative block overflow-hidden rounded-sm border border-border bg-secondary"
            >
              <img
                src={hero.image_url}
                alt={hero.title}
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 bg-background/90 px-5 py-4 backdrop-blur">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Featured
                  </p>
                  <p className="font-serif text-xl">{hero.title}</p>
                </div>
                <p className="text-sm">{priceLabel(hero)}</p>
              </div>
            </Link>
          )}
        </section>

        <section id="catalogue" className="py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl">The posters</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                    category === c
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">
              No posters published yet. Add some from the dashboard.
            </p>
          ) : (
            <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((print) => (
                <Link
                  key={print.id}
                  to="/prints/$slug"
                  params={{ slug: print.slug }}
                  className="group"
                >
                  <div className="overflow-hidden rounded-sm border border-border bg-secondary">
                    <img
                      src={print.image_url}
                      alt={print.title}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg leading-tight">{print.title}</h3>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {print.category} ·{" "}
                        {print.sizes.length > 0
                          ? print.sizes.map((s) => s.label).join(", ")
                          : print.size}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{priceLabel(print)}</p>
                      {!print.in_stock && (
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          Sold out
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Didar.Press</p>
          <p>Printed to order. Order and pay via WhatsApp.</p>
        </div>
      </footer>
    </div>
  );
}
