import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & delivery — PostersByDidar" },
      { name: "description", content: "How and when your poster order is delivered." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <PolicyPage eyebrow="Delivery" title="Shipping & delivery">
      <p>
        Every poster is printed after you order — nothing sits on a shelf waiting to be
        picked, which keeps quality high but does mean a short wait before dispatch.
      </p>

      <h2 className="text-foreground">Processing time</h2>
      <p>
        Orders are printed within 1–3 business days of your order being confirmed on
        WhatsApp. You'll get an update once your poster is ready to send.
      </p>

      <h2 className="text-foreground">Delivery time</h2>
      <p>
        Local delivery typically takes 2–5 business days after dispatch, depending on your
        location. We'll share an estimated delivery window when your order is confirmed.
      </p>

      <h2 className="text-foreground">Packaging</h2>
      <p>
        Posters are rolled and packed in a rigid tube or reinforced flat mailer to keep them
        flat and crease-free in transit.
      </p>

      <h2 className="text-foreground">Delivery charges</h2>
      <p>
        Orders above ₹400 ship free. For orders under ₹400, delivery charges depend on your
        location and are confirmed with you directly over WhatsApp before you pay — there are
        no hidden fees added later.
      </p>

      <h2 className="text-foreground">Tracking your order</h2>
      <p>
        Since orders are handled directly over WhatsApp, that's also where you'll get
        dispatch confirmation and any tracking details, if available for your area.
      </p>
    </PolicyPage>
  );
}
