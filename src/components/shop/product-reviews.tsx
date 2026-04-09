"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { name: string; avatar: string | null };
}

interface ProductReviewsProps {
  productId: string;
  isLoggedIn?: boolean;
}

// 星星评分组件
function StarRating({
  rating,
  size = "sm",
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            "transition-colors",
            i <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted",
            interactive && "cursor-pointer hover:text-yellow-400"
          )}
          onClick={() => interactive && onRate?.(i)}
        />
      ))}
    </div>
  );
}

// 评价摘要（用于产品详情 Sheet）
export function ReviewSummary({
  productId,
}: {
  productId: string;
}) {
  const [avgRating, setAvgRating] = useState(0);
  const [count, setCount] = useState(0);
  const t = useTranslations("reviews");

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setAvgRating(data.averageRating || 0);
        setCount(data.count || 0);
      })
      .catch(() => {});
  }, [productId]);

  if (count === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={Math.round(avgRating)} />
      <span className="text-xs text-muted-foreground">
        {avgRating.toFixed(1)} ({t("reviewCount", { count })})
      </span>
    </div>
  );
}

// 完整评价列表组件
export function ProductReviews({ productId, isLoggedIn }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [count, setCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("reviews");

  const fetchReviews = useCallback(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating || 0);
        setCount(data.count || 0);
      })
      .catch(() => {});
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async () => {
    if (!newRating) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating: newRating, content: newContent }),
      });
      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
        setNewRating(0);
        setNewContent("");
        fetchReviews();
      }
    } catch {
      // 忽略
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 评价概览 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{t("title")}</h3>
          {count > 0 ? (
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={Math.round(avgRating)} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({t("reviewCount", { count })})
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{t("noReviews")}</p>
          )}
        </div>
        {isLoggedIn && !showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {t("writeReview")}
          </button>
        )}
      </div>

      {/* 提交成功提示 */}
      {submitted && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
          {t("reviewSubmitted")}
        </div>
      )}

      {/* 写评价表单 */}
      {showForm && (
        <div className="rounded-xl border border-border p-4 space-y-3">
          <div>
            <label className="text-sm font-medium">{t("rating")}</label>
            <div className="mt-1">
              <StarRating rating={newRating} size="md" interactive onRate={setNewRating} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">{t("reviewContent")}</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
              placeholder={t("reviewContent")}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!newRating || submitting}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "..." : t("submitReview")}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* 评价列表 */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {review.user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{review.user.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-1.5">
                <StarRating rating={review.rating} />
              </div>
              {review.content && (
                <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {count === 0 && !showForm && (
        <p className="text-center text-sm text-muted-foreground py-4">
          {t("beFirst")}
        </p>
      )}
    </div>
  );
}
