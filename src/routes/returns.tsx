import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & refunds — PostersByDidar" },
      { name: "description", content: "Our returns, refunds, and damage policy." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <PolicyPage eyebrow="Returns" title="Returns & refunds">
      <p>
        Because every poster is printed specifically for your order, we're not able to
        accept returns for a change of mind. That said, we want you to be happy with what
        arrives — here's how we handle issues.
      </p>

      <h2 className="text-foreground">Damaged or incorrect orders</h2>
      <p>
        If your poster arrives damaged, or you receive the wrong item, message us on WhatsApp
        within 48 hours of delivery with a photo of the poster and its packaging. We'll
        arrange a free reprint or a full refund.
      </p>

      <h2 className="text-foreground">Print quality issues</h2>
      <p>
        If a print has a genuine production fault — visible banding, colour defects, or
        misalignment — let us know with photos and we'll reprint it at no extra cost.
      </p>

      <h2 className="text-foreground">Cancellations</h2>
      <p>
        You can cancel or change an order any time before we start printing. Once printing
        has begun, the order can no longer be changed or cancelled, since it's made
        specifically for you.
      </p>

      <h2 className="text-foreground">Refund method</h2>
      <p>
        Approved refunds are returned using the same payment method used for the order,
        confirmed with you directly over WhatsApp.
      </p>
    </PolicyPage>
  );
}
