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

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" className="font-serif text-2xl leading-none tracking-tight">
          Didar<span className="text-primary">.</span>Press
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            className={`rounded-full px-3 py-1.5 transition-colors hover:bg-secondary ${
              pathname === "/" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Shop
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`rounded-full px-3 py-1.5 transition-colors hover:bg-secondary ${
                pathname.startsWith("/admin") ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}
          {email ? (
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
            >
              Sign out
            </Button>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
