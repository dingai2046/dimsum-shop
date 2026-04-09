"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    originalPrice: number | null;
    wholesalePrice: number | null;
    image: string | null;
    images: string[];
    categoryId: string;
    stock: number;
    isActive: boolean;
    sortOrder: number;
    tags: string[];
    servingSize: string | null;
    soldCount: number;
  };
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.image || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  async function handleUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      alert("文件大小不能超过 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setImageUrl(data.url);
    } catch (err) {
      alert("上传失败: " + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tagsRaw = (formData.get("tags") as string) || "";
    const body = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price: Math.round(Number(formData.get("price")) * 100),
      originalPrice: formData.get("originalPrice")
        ? Math.round(Number(formData.get("originalPrice")) * 100)
        : null,
      wholesalePrice: formData.get("wholesalePrice")
        ? Math.round(Number(formData.get("wholesalePrice")) * 100)
        : null,
      categoryId: formData.get("categoryId"),
      stock: Number(formData.get("stock")),
      image: imageUrl || null,
      isActive: formData.get("isActive") === "on",
      tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
      servingSize: (formData.get("servingSize") as string) || null,
      soldCount: Number(formData.get("soldCount")) || 0,
    };

    try {
      const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      alert("保存失败: " + (err instanceof Error ? err.message : "未知错误"));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">基本信息</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">产品名称</label>
            <Input id="name" name="name" required defaultValue={product?.name} placeholder="例：鲜肉小笼包" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">URL 标识</label>
            <Input id="slug" name="slug" required defaultValue={product?.slug} placeholder="例：xianrou-xiaolongbao" className="h-11 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">产品描述</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description || ""}
            placeholder="详细描述产品特色和卖点"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="categoryId" className="text-sm font-medium">分类</label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-ring focus:ring-1 focus:ring-ring"
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">价格与库存</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">售价（元）</label>
            <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={product ? product.price / 100 : ""} placeholder="28.00" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label htmlFor="originalPrice" className="text-sm font-medium">原价（元，可选）</label>
            <Input id="originalPrice" name="originalPrice" type="number" step="0.01" min="0" defaultValue={product?.originalPrice ? product.originalPrice / 100 : ""} placeholder="35.00" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label htmlFor="wholesalePrice" className="text-sm font-medium">批发价（元，可选）</label>
            <Input id="wholesalePrice" name="wholesalePrice" type="number" step="0.01" min="0" defaultValue={product?.wholesalePrice ? product.wholesalePrice / 100 : ""} placeholder="20.00" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label htmlFor="stock" className="text-sm font-medium">库存</label>
            <Input id="stock" name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} className="h-11 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">附加信息</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">标签</label>
            <Input id="tags" name="tags" defaultValue={product?.tags?.join(", ") || ""} placeholder="招牌, 含猪肉, 辣" className="h-11 rounded-xl" />
            <p className="text-xs text-muted-foreground">多个标签用逗号分隔</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="servingSize" className="text-sm font-medium">份量</label>
            <Input id="servingSize" name="servingSize" defaultValue={product?.servingSize || ""} placeholder="每份8只" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label htmlFor="soldCount" className="text-sm font-medium">销量</label>
            <Input id="soldCount" name="soldCount" type="number" min="0" defaultValue={product?.soldCount ?? 0} className="h-11 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 产品图片 */}
      <div className="rounded-xl bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">产品图片</h2>

        {/* 图片预览 */}
        {imageUrl && (
          <div className="relative inline-block">
            <img src={imageUrl} alt="产品图片" className="h-32 w-32 rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 上传区域 */}
        <div
          className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/50"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[0];
            if (file?.type.startsWith("image/")) handleUpload(file);
          }}
        >
          {uploading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              上传中...
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-2 text-sm text-muted-foreground">点击或拖拽图片上传</p>
              <p className="mt-1 text-xs text-muted-foreground/60">JPG、PNG、WebP，最大 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* 手动输入 URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">或直接输入图片 URL</label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="rounded-xl bg-card p-6 shadow-sm">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="h-4 w-4 rounded border-border" />
          <span className="text-sm font-medium">上架销售</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || uploading} className="h-11 px-8">
          {loading ? "保存中..." : isEdit ? "保存修改" : "创建产品"}
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </form>
  );
}
