import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { getPrintBySlug } from "@/lib/prints.functions";
import { whatsappLink } from "@/lib/site-config";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const printQuery = (slug: string) =>
  queryOptions({
    queryKey: ["prints", "slug", slug],
    queryFn: async () => {
      const print = await getPrintBySlug({ data: { slug } });
      if (!print) throw notFound();
      return print;
    },
  });

export const Route = createFileRoute("/prints/$slug")({
  loader: async ({ context, params }) => {
    const print = await context.queryClient.ensureQueryData(printQuery(params.slug));
    return { print };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.print
      ? `${loaderData.print.title} — PostersByDidar`
      : "Poster — PostersByDidar";
    const description =
      loaderData?.print?.description ?? "A wall poster from the PostersByDidar studio.";
    const image = loaderData?.print?.image_url;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 155) },
        ...(image?.startsWith("https://")
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  component: PrintDetail,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-muted-foreground" role="alert">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-20 text-center">
      <h1 className="text-3xl">Poster not found</h1>
      <Link to="/" className="mt-4 inline-block text-sm text-primary underline">
        Back to the shop
      </Link>
    </div>
  ),
});

function PrintDetail() {
  const { data: print } = useSuspenseQuery(printQuery(Route.useParams().slug));
  const hasSizes = print.sizes.length > 0;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = hasSizes ? print.sizes[selectedIndex] : { label: print.size, price: print.price };
  const gallery = print.images.length > 0 ? print.images : [print.image_url];
  const [activeImage, setActiveImage] = useState(0);

  const orderMessage = [
    `Hi! I'd like to order this poster:`,
    print.title,
    `Size: ${selected.label} — ₹${selected.price.toFixed(2)}`,
    typeof window !== "undefined" ? window.location.href : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All posters
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div>
            <div className="reg-mark overflow-hidden border-2 border-foreground bg-secondary">
              <img
                src={gallery[activeImage]}
                alt={print.title}
                className="aspect-square w-full object-cover"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {gallery.map((src, index) => (
                  <button
                    key={src + index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    className={`overflow-hidden border-2 ${
                      index === activeImage ? "border-primary" : "border-border"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      aria-hidden="true"
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:pt-6">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
              {print.category}
            </p>
            <h1 className="mt-3 text-4xl normal-case">{print.title}</h1>
            <p className="mt-4 font-mono text-2xl">₹{selected.price.toFixed(2)}</p>
            <p className="mt-6 max-w-prose leading-relaxed text-muted-foreground">
              {print.description}
            </p>

            {hasSizes && (
              <div className="mt-8">
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Choose a size
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {print.sizes.map((option, index) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`border px-4 py-2 font-mono text-sm transition-colors ${
                        index === selectedIndex
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/40"
                      }`}
                    >
                      {option.label} · ₹{option.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-4 border-y-2 border-foreground py-6 font-mono text-sm">
              <div>
                <dt className="text-muted-foreground">Paper size</dt>
                <dd className="mt-1">{selected.label}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="mt-1">
                  {print.in_stock ? (
                    "Printed to order"
                  ) : (
                    <Badge variant="secondary" className="rounded-none">
                      Sold out
                    </Badge>
                  )}
                </dd>
              </div>
            </dl>

            <Button
              asChild={print.in_stock}
              size="lg"
              className="mt-8 w-full gap-2 rounded-none bg-[#25D366] font-mono uppercase tracking-wide text-white hover:bg-[#1ebe5a]"
              disabled={!print.in_stock}
            >
              {print.in_stock ? (
                <a href={whatsappLink(orderMessage)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                </a>
              ) : (
                <span>Sold out</span>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Orders and payment are handled directly over WhatsApp.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
