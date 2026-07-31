import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Standard Vite config for TanStack Start — no Lovable-specific plugins.
// Nitro (via the `nitro()` plugin) is what Vercel detects for zero-config
// deployment: https://vercel.com/docs/frameworks/full-stack/tanstack-start
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts
      // (our SSR error wrapper). Nitro builds from this.
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
  ],
});
