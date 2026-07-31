// Update this to your real WhatsApp number before deploying.
// Format: country code + number, digits only, no "+", no spaces, no leading 0.
// Example UK mobile 07123 456789 -> "447123456789"
export const WHATSAPP_NUMBER = "918368882312";

export const STUDIO_NAME = "PostersByDidar";

/**
 * Builds a wa.me deep link that opens WhatsApp with a prefilled message.
 */
export function whatsappLink(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
