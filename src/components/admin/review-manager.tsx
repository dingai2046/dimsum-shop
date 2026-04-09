"use client";

import { useState } from "react";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  rating: number;
  content: string | null;
  images: string[];
  isVisible: boolean;
  createdAt: string;
  user: { name: string | null; email: string | null };
  product: { name: string; image: string | null };
}

export function AdminReviewManager({
  initialReviews,
}: {
  initialReviews: ReviewItem[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const handleToggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isVisible: !currentVisible }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isVisible: !currentVisible } : r))
        );
      }
    } catch {
      // 忽略
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该评价？")) return;
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // 忽略
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("reviews")}</h1>
        <span className="text-sm text-muted-foreground">
          {reviews.length} 条评价
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl bg-card p-12 text-center text-muted-foreground">
          {tCommon("noData")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">产品</th>
                <th className="px-4 py-3 text-left font-medium">用户</th>
                <th className="px-4 py-3 text-left font-medium">评分</th>
                <th className="px-4 py-3 text-left font-medium">内容</th>
                <th className="px-4 py-3 text-left font-medium">{t("status")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("time")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("operation")}</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-border last:border-0">
                  {/* 产品 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {review.product.image && (
                        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-muted">
                          <Image
                            src={review.product.image}
                            alt={review.product.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      )}
                      <span className="max-w-[120px] truncate">{review.product.name}</span>
                    </div>
                  </td>
                  {/* 用户 */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{review.user.name || "匿名"}</p>
                      <p className="text-xs text-muted-foreground">{review.user.email}</p>
                    </div>
                  </td>
                  {/* 评分 */}
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5",
                            i <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                          )}
                        />
                      ))}
                    </div>
                  </td>
                  {/* 内容 */}
                  <td className="px-4 py-3">
                    <p className="max-w-[200px] truncate text-muted-foreground">
                      {review.content || "-"}
                    </p>
                  </td>
                  {/* 状态 */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        review.isVisible
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {review.isVisible ? t("reviewVisible") : t("reviewHidden")}
                    </span>
                  </td>
                  {/* 时间 */}
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  {/* 操作 */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleVisibility(review.id, review.isVisible)}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title={t("toggleVisibility")}
                      >
                        {review.isVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                        title={tCommon("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
