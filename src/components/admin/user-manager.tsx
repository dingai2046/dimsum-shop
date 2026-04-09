"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  avatar: string | null;
  points: number;
  role: string;
  buyerType: string;
  createdAt: string;
  orderCount: number;
}

interface UserManagerProps {
  initialUsers: User[];
}

const PAGE_SIZE = 15;

export function UserManager({ initialUsers }: UserManagerProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 编辑表单状态
  const [formRole, setFormRole] = useState("CUSTOMER");
  const [formBuyerType, setFormBuyerType] = useState("RETAIL");
  const [formPointsAdjust, setFormPointsAdjust] = useState("0");

  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openEdit(user: User) {
    setEditing(user);
    setFormRole(user.role);
    setFormBuyerType(user.buyerType);
    setFormPointsAdjust("0");
    setError("");
    setOpen(true);
  }

  async function handleSave() {
    if (!editing) return;
    setLoading(true);
    setError("");

    const pointsAdjust = parseInt(formPointsAdjust) || 0;

    try {
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: formRole,
          buyerType: formBuyerType,
          pointsAdjust: pointsAdjust,
        }),
      });

      if (res.ok) {
        // 更新本地状态
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editing.id
              ? {
                  ...u,
                  role: formRole,
                  buyerType: formBuyerType,
                  points: u.points + pointsAdjust,
                }
              : u
          )
        );
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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{t("users")}</h1>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {tCommon("user")}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  {t("role")}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  {t("buyerType")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("pointsAdjust").replace("调整", "")}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  {t("ordersPlaced")}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  {t("registeredAt")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  {t("operation")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">
                        {user.name || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email || user.phone || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Customer"}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Badge variant="outline">
                      {user.buyerType === "WHOLESALE"
                        ? t("wholesale")
                        : t("retail")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{user.points}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {user.orderCount}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(user)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {tCommon("edit")}
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {tCommon("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {tCommon("total")} {users.length} {tCommon("user")}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 编辑用户对话框 */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setEditing(null);
            setError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editUser")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="mt-2 space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* 用户信息（只读） */}
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-sm font-medium">
                  {editing.name || "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {editing.email || editing.phone || "-"}
                </div>
              </div>

              {/* 角色 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("role")}</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* 买家类型 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("buyerType")}</label>
                <select
                  value={formBuyerType}
                  onChange={(e) => setFormBuyerType(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="RETAIL">{t("retail")}</option>
                  <option value="WHOLESALE">{t("wholesale")}</option>
                </select>
              </div>

              {/* 积分调整 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("pointsAdjust")}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({t("pointsAdjust").includes("积分") ? "当前" : "Current"}:{" "}
                    {editing.points})
                  </span>
                </label>
                <Input
                  type="number"
                  value={formPointsAdjust}
                  onChange={(e) => setFormPointsAdjust(e.target.value)}
                  placeholder="+100 或 -50"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="h-11 flex-1"
                >
                  {loading ? tCommon("saving") : tCommon("save")}
                </Button>
                <DialogClose className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted">
                  {tCommon("cancel")}
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
