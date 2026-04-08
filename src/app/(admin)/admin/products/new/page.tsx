import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回产品列表
      </Link>
      <h1 className="mb-6 text-2xl font-bold">新增产品</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
