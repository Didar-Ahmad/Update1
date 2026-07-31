import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type SizeOption = { label: string; price: number };

export type Print = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  size: string;
  sizes: SizeOption[];
  category: string;
  image_url: string;
  images: string[];
  in_stock: boolean;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const COLUMNS =
  "id,title,slug,description,price,size,sizes,category,image_url,images,in_stock,featured,published,created_at,updated_at";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    },
  );
}

function parseSizes(value: unknown): SizeOption[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const label = String((entry as Record<string, unknown>).label ?? "").trim();
      const price = Number((entry as Record<string, unknown>).price);
      if (!label || Number.isNaN(price)) return null;
      return { label, price };
    })
    .filter((entry): entry is SizeOption => entry !== null);
}

function parseImages(value: unknown, fallback: string): string[] {
  const list = Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string" && v.length > 0)
    : [];
  return list.length > 0 ? list : fallback ? [fallback] : [];
}

function toPrint(row: Record<string, unknown>): Print {
  return {
    ...(row as unknown as Print),
    price: Number(row.price),
    sizes: parseSizes(row.sizes),
    images: parseImages(row.images, String(row.image_url ?? "")),
  };
}

export const listPublishedPrints = createServerFn({ method: "GET" }).handler(
  async (): Promise<Print[]> => {
    const { data, error } = await publicClient()
      .from("prints")
      .select(COLUMNS)
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toPrint);
  },
);

export const getPrintBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }): Promise<Print | null> => {
    const { data: row, error } = await publicClient()
      .from("prints")
      .select(COLUMNS)
      .eq("published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? toPrint(row) : null;
  });
