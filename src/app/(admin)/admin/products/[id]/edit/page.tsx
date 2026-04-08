import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/api/categories";
import { getProductBySlug } from "@/lib/api/products";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

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
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回产品列表
      </Link>
      <h1 className="mb-6 text-2xl font-bold">编辑产品：{product.name}</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
