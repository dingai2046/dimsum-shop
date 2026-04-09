"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon?: string | null;
  sortOrder: number;
}

interface CategoryManagerProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
}

export function CategoryManager({ categories, categoryCounts }: CategoryManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      icon: formData.get("icon") as string,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    };

    try {
      const url = editing
        ? `/api/admin/categories/${editing.id}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setOpen(false);
        setEditing(null);
        router.refresh();
      } else {
        const result = await res.json();
        setError(result.error || tCommon("operationFailed"));
      }
    } catch {
      setError(tCommon("networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(t("deleteCategory", { name }))) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const result = await res.json();
        alert(result.error || tCommon("deleteFailed"));
      }
    } catch {
      alert(tCommon("networkError"));
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t("newCategory")}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-10 px-3 py-3"></th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("categoryName")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">{t("categoryDesc")}</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t("productCount")}</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">{t("operation")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </td>
                <td className="px-4 py-3 font-medium">
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell max-w-[200px] truncate">
                  {cat.description}
                </td>
                <td className="px-4 py-3">{categoryCounts[cat.slug] || 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditing(cat); setOpen(true); }}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {tCommon("edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setError(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("editCategory") : t("newCategory")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("categoryName")}</label>
              <Input name="name" required defaultValue={editing?.name} placeholder="例：水饺" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("categorySlug")}</label>
              <Input name="slug" required defaultValue={editing?.slug} placeholder="例：dumplings" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("categoryIcon")}</label>
              <Input name="icon" defaultValue={editing?.icon || ""} placeholder="例：🥟" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("categoryDesc")}</label>
              <Input name="description" defaultValue={editing?.description || ""} placeholder="简短描述" className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("sortOrder")} ({t("sortOrderHint")})</label>
              <Input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} className="h-11 rounded-xl" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 h-11">
                {loading ? tCommon("saving") : editing ? t("saveChanges") : t("createCategory")}
              </Button>
              <DialogClose className="flex-1 h-11 inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors">
                {tCommon("cancel")}
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
