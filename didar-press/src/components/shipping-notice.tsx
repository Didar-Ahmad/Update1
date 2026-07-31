import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SEEN_KEY = "shipping-notice-seen";

/**
 * One-time-per-session popup explaining the free-shipping threshold.
 * Shown once when a visitor lands on the shop, not on every navigation.
 */
export function ShippingNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem(SEEN_KEY);
    if (!seen) setOpen(true);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.sessionStorage.setItem(SEEN_KEY, "1");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent className="rounded-none sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal normal-case">
            Free shipping over ₹400
          </DialogTitle>
          <DialogDescription className="pt-2 text-left leading-relaxed">
            Orders above <span className="font-mono text-foreground">₹400</span> ship free.
            For orders under ₹400, delivery charges depend on your location and are confirmed
            with you directly over WhatsApp before payment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={dismiss} className="w-full rounded-none">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
