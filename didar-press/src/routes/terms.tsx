import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — PostersByDidar" },
      { name: "description", content: "The terms that apply to orders placed with PostersByDidar." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PolicyPage eyebrow="Legal" title="Terms of service">
      <p>
        These terms apply whenever you browse this site or place an order with PostersByDidar.
        By using the site or placing an order, you agree to them.
      </p>

      <h2 className="text-foreground">Orders</h2>
      <p>
        Browsing and adding a poster to your view on this site does not place an order.
        An order is only confirmed once details and payment are agreed directly over
        WhatsApp.
      </p>

      <h2 className="text-foreground">Pricing</h2>
      <p>
        Prices shown on the site are per size and are correct at the time of listing, but are
        confirmed again with you before payment. Delivery charges are quoted separately.
      </p>

      <h2 className="text-foreground">Product images</h2>
      <p>
        Poster images are as accurate as possible, but slight variation in colour is normal
        between a screen and a printed piece.
      </p>

      <h2 className="text-foreground">Intellectual property</h2>
      <p>
        Artwork sold through PostersByDidar is licensed or created for print. Reproducing,
        reselling, or redistributing a purchased print without permission isn't allowed.
      </p>

      <h2 className="text-foreground">Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the site after a change
        means you accept the updated terms.
      </p>
    </PolicyPage>
  );
}
