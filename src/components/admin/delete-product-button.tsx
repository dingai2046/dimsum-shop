"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`确定要删除产品「${productName}」吗？此操作不可恢复。`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "删除失败");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      alert("删除失败: " + (err instanceof Error ? err.message : "未知错误"));
      setLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      className="gap-1.5"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "删除中..." : "删除产品"}
    </Button>
  );
}
