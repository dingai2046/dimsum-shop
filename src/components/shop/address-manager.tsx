"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Check, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AU_STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

interface Address {
  id: string;
  name: string;
  phone: string;
  street1: string;
  street2: string | null;
  suburb: string;
  state: string;
  postcode: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  initialAddresses: Address[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("address");
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");

  const [form, setForm] = useState({
    name: "", phone: "", street1: "", street2: "",
    suburb: "", state: "VIC", postcode: "", isDefault: false,
  });

  function openNew() {
    setEditing(null);
    setForm({ name: "", phone: "", street1: "", street2: "", suburb: "", state: "VIC", postcode: "", isDefault: false });
    setOpen(true);
  }

  function openEdit(addr: Address) {
    setEditing(addr);
    setForm({
      name: addr.name, phone: addr.phone, street1: addr.street1,
      street2: addr.street2 || "", suburb: addr.suburb, state: addr.state,
      postcode: addr.postcode, isDefault: addr.isDefault,
    });
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editing ? `/api/addresses/${editing.id}` : "/api/addresses";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
        // 刷新列表
        const listRes = await fetch("/api/addresses");
        if (listRes.ok) {
          const { addresses: updated } = await listRes.json();
          setAddresses(updated);
        }
      } else {
        const data = await res.json();
        setError(data.error || tCommon("operationFailed"));
      }
    } catch {
      setError(tCommon("networkError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      alert(tCommon("deleteFailed"));
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t("add")}
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl bg-card p-5 shadow-sm relative">
              {addr.isDefault && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Check className="h-3 w-3" />
                  {t("default")}
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{addr.name}</span>
                    <span className="text-sm text-muted-foreground">{addr.phone}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {addr.street1}
                    {addr.street2 ? `, ${addr.street2}` : ""}
                    , {addr.suburb} {addr.state} {addr.postcode}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(addr)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">{t("noAddress")}</p>
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("edit") : t("add")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3 mt-2">
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{tCheckout("name")} *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{tCheckout("phone")} *</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="h-10 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{tCheckout("street")} *</label>
              <Input value={form.street1} onChange={(e) => setForm({ ...form, street1: e.target.value })} required placeholder="123 Smith Street" className="h-10 rounded-lg" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">{tCheckout("unit")}</label>
              <Input value={form.street2} onChange={(e) => setForm({ ...form, street2: e.target.value })} placeholder="Unit 5" className="h-10 rounded-lg" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{tCheckout("suburb")} *</label>
                <Input value={form.suburb} onChange={(e) => setForm({ ...form, suburb: e.target.value })} required className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{tCheckout("state")} *</label>
                <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {AU_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">{tCheckout("postcode")} *</label>
                <Input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} required maxLength={4} className="h-10 rounded-lg" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
              {t("setDefault")}
            </label>
            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? tCommon("saving") : editing ? tCommon("save") : t("add")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
