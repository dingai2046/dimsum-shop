"use client";

import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  initialFavorited: boolean;
  /** 收藏记录的 ID，取消收藏时使用 */
  favoriteId?: string;
  className?: string;
}

export function FavoriteButton({
  productId,
  initialFavorited,
  favoriteId: initialFavoriteId,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favId, setFavId] = useState(initialFavoriteId);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setAnimating(true);

    try {
      if (favorited && favId) {
        // 取消收藏
        const res = await fetch(`/api/favorites/${favId}`, { method: "DELETE" });
        if (res.ok) {
          setFavorited(false);
          setFavId(undefined);
        }
      } else {
        // 添加收藏
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          const data = await res.json();
          setFavorited(true);
          setFavId(data.favorite.id);
        } else if (res.status === 401) {
          // 未登录，跳转登录
          window.location.href = "/login?callbackUrl=" + encodeURIComponent(window.location.pathname);
          return;
        }
      }
    } catch {
      // 忽略网络错误
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  }, [favorited, favId, productId, loading]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      disabled={loading}
      className={cn(
        "flex items-center justify-center rounded-full p-2 transition-all active:scale-90",
        favorited
          ? "text-red-500"
          : "text-muted-foreground hover:text-red-400",
        className
      )}
      aria-label={favorited ? "取消收藏" : "收藏"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-transform duration-300",
          favorited && "fill-current",
          animating && "scale-125"
        )}
      />
    </button>
  );
}
