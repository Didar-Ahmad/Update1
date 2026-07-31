import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, ExternalLink, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/admin.functions";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — PostersByDidar" },
      { name: "description", content: "Add, update and remove posters in the PostersByDidar catalogue." },
      { property: "og:title", content: "Dashboard — PostersByDidar" },
      { property: "og:description", content: "Manage the PostersByDidar poster catalogue." },
    ],
  }),
  component: AdminPage,
});

type SizeOption = { label: string; price: number };

type PrintRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  size: string;
  sizes: SizeOption[];
  category: string;
  image_url: string;
  in_stock: boolean;
  featured: boolean;
  published: boolean;
};

type SizeFormRow = { label: string; price: string };

const emptySizeRows: SizeFormRow[] = [
  { label: "A4", price: "8" },
  { label: "A3", price: "12" },
];

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  category: "Poster",
  image_url: "",
  in_stock: true,
  featured: false,
  published: true,
  sizes: emptySizeRows,
};

type FormState = typeof emptyForm;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function parseSizesForDb(rows: SizeFormRow[]) {
  return rows
    .map((row) => ({ label: row.label.trim(), price: Number(row.price) }))
    .filter((row) => row.label && !Number.isNaN(row.price) && row.price >= 0);
}

function AdminPage() {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrintRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PrintRow | null>(null);
  const [uploading, setUploading] = useState(false);

  const refreshRole = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return setIsAdmin(false);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    setIsAdmin((data ?? []).some((r) => r.role === "admin"));
  };

  useEffect(() => {
    refreshRole();
  }, []);

  const printsQuery = useQuery({
    queryKey: ["admin", "prints"],
    enabled: isAdmin === true,
    queryFn: async (): Promise<PrintRow[]> => {
      const { data, error } = await supabase
        .from("prints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map((row) => ({
        ...row,
        price: Number(row.price),
        sizes: Array.isArray(row.sizes) ? (row.sizes as unknown as SizeOption[]) : [],
      })) as PrintRow[];
    },
  });

  const prints = printsQuery.data ?? [];
  const stats = useMemo(
    () => ({
      total: prints.length,
      published: prints.filter((p) => p.published).length,
      soldOut: prints.filter((p) => !p.in_stock).length,
    }),
    [prints],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "prints"] });
    queryClient.invalidateQueries({ queryKey: ["prints"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: FormState) => {
      const sizes = parseSizesForDb(values.sizes);
      const fallbackPrice = sizes[0]?.price ?? 0;
      const fallbackSize = sizes[0]?.label ?? "A4";

      const payload = {
        title: values.title.trim(),
        slug: slugify(values.slug || values.title),
        description: values.description.trim(),
        price: fallbackPrice,
        size: fallbackSize,
        sizes,
        category: values.category.trim() || "Poster",
        image_url: values.image_url.trim(),
        in_stock: values.in_stock,
        featured: values.featured,
        published: values.published,
      };
      if (!payload.title) throw new Error("Give the poster a title.");
      if (!payload.image_url) throw new Error("Upload or link an image for the poster.");
      if (sizes.length === 0) throw new Error("Add at least one size and price.");

      if (editing) {
        const { error } = await supabase.from("prints").update(payload).eq("id", editing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("prints").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Poster updated" : "Poster added");
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prints").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Poster deleted");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const togglePublished = useMutation({
    mutationFn: async (print: PrintRow) => {
      const { error } = await supabase
        .from("prints")
        .update({ published: !print.published })
        .eq("id", print.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (print: PrintRow) => {
    setEditing(print);
    setForm({
      title: print.title,
      slug: print.slug,
      description: print.description,
      category: print.category,
      image_url: print.image_url,
      in_stock: print.in_stock,
      featured: print.featured,
      published: print.published,
      sizes:
        print.sizes.length > 0
          ? print.sizes.map((s) => ({ label: s.label, price: String(s.price) }))
          : [{ label: print.size || "A4", price: String(print.price || 0) }],
    });
    setDialogOpen(true);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("poster-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("poster-images").getPublicUrl(path);
      setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Upload failed — make sure the poster-images storage bucket exists (see README).",
      );
    } finally {
      setUploading(false);
    }
  };

  const updateSizeRow = (index: number, patch: Partial<SizeFormRow>) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  };

  const addSizeRow = () => {
    setForm((prev) => ({ ...prev, sizes: [...prev.sizes, { label: "", price: "" }] }));
  };

  const removeSizeRow = (index: number) => {
    setForm((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <p className="p-20 text-center text-muted-foreground">Checking your access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="text-3xl">Studio access needed</h1>
          <p className="mt-3 text-muted-foreground">
            Your account isn't an admin yet. If you're setting the shop up for the first time, claim
            the studio below — this only works while no admin exists.
          </p>
          <Button
            className="mt-6"
            disabled={checking}
            onClick={async () => {
              setChecking(true);
              try {
                const result = await claimFirstAdmin();
                if (result.granted) {
                  toast.success("You're the studio admin now.");
                  await refreshRole();
                } else {
                  toast.error(result.reason);
                }
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not claim access");
              } finally {
                setChecking(false);
              }
            }}
          >
            {checking ? "Working…" : "Claim studio access"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Dashboard</p>
            <h1 className="mt-2 text-4xl">Posters</h1>
          </div>
          <Button onClick={openCreate} className="rounded-none">
            <Plus className="mr-1 h-4 w-4" /> Add poster
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total posters", value: stats.total },
            { label: "Published", value: stats.published },
            { label: "Sold out", value: stats.soldOut },
          ].map((s) => (
            <div key={s.label} className="rounded-sm border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-serif text-3xl">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-sm border border-border">
          {printsQuery.isLoading ? (
            <p className="p-10 text-center text-muted-foreground">Loading catalogue…</p>
          ) : prints.length === 0 ? (
            <p className="p-10 text-center text-muted-foreground">
              No posters yet — add your first one.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Poster</th>
                  <th className="hidden p-3 font-medium sm:table-cell">Category</th>
                  <th className="p-3 font-medium">Sizes &amp; prices</th>
                  <th className="hidden p-3 font-medium md:table-cell">Status</th>
                  <th className="p-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prints.map((print) => (
                  <tr key={print.id} className="border-t border-border align-middle">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={print.image_url}
                          alt={print.title}
                          className="h-14 w-11 rounded-sm border border-border object-cover"
                        />
                        <div>
                          <p className="font-medium">{print.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden p-3 text-muted-foreground sm:table-cell">
                      {print.category}
                    </td>
                    <td className="p-3">
                      {print.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {print.sizes.map((s) => (
                            <span
                              key={s.label}
                              className="rounded-none border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground"
                            >
                              {s.label} ₹{s.price.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          {print.size} · ₹{print.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="hidden p-3 md:table-cell">
                      <div className="flex flex-wrap items-center gap-2">
                        <Switch
                          checked={print.published}
                          onCheckedChange={() => togglePublished.mutate(print)}
                          aria-label="Published"
                        />
                        <span className="text-xs text-muted-foreground">
                          {print.published ? "Published" : "Draft"}
                        </span>
                        {!print.in_stock && (
                          <Badge variant="secondary" className="text-[10px]">
                            Sold out
                          </Badge>
                        )}
                        {print.featured && (
                          <Badge className="text-[10px]">Featured</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label="View poster">
                          <Link to="/prints/$slug" params={{ slug: print.slug }}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit poster"
                          onClick={() => openEdit(print)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete poster"
                          onClick={() => setDeleteTarget(print)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-normal">
              {editing ? "Edit poster" : "Add a poster"}
            </DialogTitle>
            <DialogDescription>
              Details shown on the shop page. Upload the artwork image and set a price per size.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(form);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_file">Poster image</Label>
              <div className="flex items-center gap-3">
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="h-16 w-14 rounded-sm border border-border object-cover"
                  />
                )}
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:border-foreground/40">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Upload image"}
                  <input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <Input
                value={form.image_url}
                placeholder="Or paste an image URL…"
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sizes &amp; prices</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSizeRow}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add size
                </Button>
              </div>
              <div className="space-y-2">
                {form.sizes.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Size, e.g. A4"
                      value={row.label}
                      onChange={(e) => updateSizeRow(index, { label: e.target.value })}
                      className="flex-1"
                    />
                    <div className="relative w-28">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={row.price}
                        onChange={(e) => updateSizeRow(index, { price: e.target.value })}
                        className="pl-6"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove size"
                      onClick={() => removeSizeRow(index)}
                      disabled={form.sizes.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Link slug</Label>
              <Input
                id="slug"
                value={form.slug}
                placeholder={slugify(form.title) || "auto-generated"}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["published", "Published"],
                  ["in_stock", "In stock"],
                  ["featured", "Featured"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2 text-sm"
                >
                  {label}
                  <Switch
                    checked={form[key]}
                    onCheckedChange={(checked) => setForm({ ...form, [key]: checked })}
                  />
                </label>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending || uploading}>
                {saveMutation.isPending ? "Saving…" : editing ? "Save changes" : "Add poster"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the poster from the shop permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
