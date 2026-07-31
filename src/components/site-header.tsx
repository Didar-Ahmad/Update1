import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setEmail(data.user?.email ?? null);
      if (!data.user) {
        setIsAdmin(false);
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (!active) return;
      setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    };

    load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") load();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const navLink = (active: boolean) =>
    `border-b-2 px-1 py-1 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
      active
        ? "border-primary text-foreground"
        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          to="/"
          className="reg-mark px-2 font-serif text-lg leading-none whitespace-nowrap sm:text-2xl"
        >
          POSTERS<span className="text-primary">BY</span>DIDAR
        </Link>

        <nav className="flex items-center gap-5">
          <Link to="/" className={navLink(pathname === "/")}>
            Shop
          </Link>
          {isAdmin && (
            <Link to="/admin" className={navLink(pathname.startsWith("/admin"))}>
              Dashboard
            </Link>
          )}
          {email ? (
            <Button
              variant="outline"
              size="sm"
              className="ml-1 rounded-none border-foreground font-mono text-xs uppercase tracking-wider"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
            >
              Sign out
            </Button>
          ) : (
            <Button
              asChild
              size="sm"
              className="ml-1 rounded-none font-mono text-xs uppercase tracking-wider"
            >
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
