import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/policy-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — PostersByDidar" },
      { name: "description", content: "How PostersByDidar handles your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PolicyPage eyebrow="Legal" title="Privacy policy">
      <p>
        This policy explains what information we collect when you use this site and how it's
        used. We keep this simple: we collect only what's needed to run the shop and fulfil
        orders.
      </p>

      <h2 className="text-foreground">Information we collect</h2>
      <p>
        If you create an account to manage the shop, we store your email address for sign-in.
        Order details (poster, size, and delivery information) are shared directly with us
        through WhatsApp when you place an order, and are not collected through this website
        itself.
      </p>

      <h2 className="text-foreground">How we use it</h2>
      <p>
        Account information is used only to sign in and manage the poster catalogue.
        Order information shared over WhatsApp is used solely to print, package, and deliver
        your order.
      </p>

      <h2 className="text-foreground">Third parties</h2>
      <p>
        We use Supabase to store shop data and WhatsApp to handle orders and communication.
        We don't sell or share your information with advertisers.
      </p>

      <h2 className="text-foreground">Your rights</h2>
      <p>
        You can ask us to access or delete any information we hold about you at any time by
        messaging us on WhatsApp.
      </p>
    </PolicyPage>
  );
}
