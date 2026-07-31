import { Link } from "@tanstack/react-router";

const columns: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "All posters", to: "/" },
      { label: "Studio login", to: "/auth" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Shipping & delivery", to: "/shipping" },
      { label: "Returns & refunds", to: "/returns" },
      { label: "About us", to: "/about" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of service", to: "/terms" },
      { label: "Privacy policy", to: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="reg-mark inline-block px-1 font-serif text-lg leading-none">
            POSTERS<span className="text-primary">BY</span>DIDAR
          </p>
          <p className="mt-3 max-w-[22ch] text-sm text-muted-foreground">
            Wall posters, printed to order and delivered locally.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
              {col.heading}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <p>© {new Date().getFullYear()} PostersByDidar</p>
          <p>Printed to order. Order and pay via WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
}
