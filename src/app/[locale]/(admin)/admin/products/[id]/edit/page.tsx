import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { getProductBySlug } from "@/lib/api/products";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const categories = await getCategories();
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/products"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回产品列表
          </Link>
          <h1 className="text-2xl font-bold">编辑产品：{product.name}</h1>
        </div>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
