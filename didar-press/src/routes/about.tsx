import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — PostersByDidar" },
      {
        name: "description",
        content: "Who's behind PostersByDidar and how our posters are printed.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PolicyPage eyebrow="About us" title="Small studio, big prints" banner="/brand/hero-coast.jpg">
      <p>
        PostersByDidar is a small, independent print studio. Every poster is printed to order
        rather than kept in bulk stock — that keeps the range fresh, cuts down on waste, and
        means the print you receive is made specifically for you.
      </p>

      <h2 className="text-foreground">What we do</h2>
      <p>
        We select and print artwork, photography, and typographic designs suited to home
        walls — from small A4 prints for a shelf or desk to larger A2 and A1 statement pieces
        for a living room or studio.
      </p>

      <h2 className="text-foreground">How ordering works</h2>
      <p>
        Browse the shop, pick a poster and a size, and message us directly on WhatsApp to
        confirm your order and arrange payment. No account or checkout required — it's a
        conversation, the way buying from a local print shop should feel.
      </p>

      <h2 className="text-foreground">Get in touch</h2>
      <p>
        Have a question about a poster, a custom size, or a bulk order? Reach us any time
        using the WhatsApp button on this site.
      </p>
    </PolicyPage>
  );
}
