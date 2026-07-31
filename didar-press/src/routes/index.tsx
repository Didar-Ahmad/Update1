import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listPublishedPrints } from "@/lib/prints.functions";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShippingNotice } from "@/components/shipping-notice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const printsQuery = queryOptions({
  queryKey: ["prints", "published"],
  queryFn: () => listPublishedPrints(),
});

function priceLabel(print: { price: number; sizes: { label: string; price: number }[] }) {
  if (print.sizes.length > 0) {
    const min = Math.min(...print.sizes.map((s) => s.price));
    return `From ₹${min.toFixed(2)}`;
  }
  return `₹${print.price.toFixed(2)}`;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PostersByDidar — Wall Posters, Printed to Order" },
      {
        name: "description",
        content:
          "Browse wall posters in A4, A3, A2 and more. Order and pay directly via WhatsApp.",
      },
      { property: "og:title", content: "PostersByDidar — Wall Posters, Printed to Order" },
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
      <ShippingNotice />

      <section className="relative overflow-hidden border-b-2 border-foreground">
        <img
          src="/brand/hero-waves.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0d1524]/95 via-[#0d1524]/78 to-[#0d1524]/35"
        />

        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              Posters printed to order
            </p>
            <h1 className="mt-5 text-6xl leading-[0.98] text-white md:text-7xl">
              Wall
              <br />
              posters.
            </h1>
            <p className="mt-5 max-w-md text-white/70">
              A4, A3, A2 and larger — printed on request and delivered locally. Message us on
              WhatsApp to order and pay, no account needed.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-none px-6">
                <a href="#catalogue">Browse the posters</a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-none border-white bg-transparent text-white hover:bg-white/10 hover:text-white px-6"
              >
                <Link to="/auth">Studio login</Link>
              </Button>
            </div>
          </div>

          {hero && (
            <Link
              to="/prints/$slug"
              params={{ slug: hero.slug }}
              className="reg-mark group relative block overflow-hidden border-2 border-foreground bg-background shadow-2xl"
            >
              <img
                src={hero.image_url}
                alt={hero.title}
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 border-t-2 border-foreground bg-background px-5 py-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                    Featured
                  </p>
                  <p className="font-serif text-xl">{hero.title}</p>
                </div>
                <p className="font-mono text-sm">{priceLabel(hero)}</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-5">
        <section id="catalogue" className="py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl">The posters</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
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
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3">
              {visible.map((print) => (
                <Link
                  key={print.id}
                  to="/prints/$slug"
                  params={{ slug: print.slug }}
                  className="group"
                >
                  <div className="overflow-hidden border border-border bg-secondary transition-colors group-hover:border-foreground">
                    <img
                      src={print.image_url}
                      alt={print.title}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg leading-tight normal-case">{print.title}</h3>
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {print.category} ·{" "}
                        {print.sizes.length > 0
                          ? print.sizes.map((s) => s.label).join(", ")
                          : print.size}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">{priceLabel(print)}</p>
                      {!print.in_stock && (
                        <Badge variant="secondary" className="mt-1 rounded-none text-[10px]">
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

      <SiteFooter />
    </div>
  );
}
