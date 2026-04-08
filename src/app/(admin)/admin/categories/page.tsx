import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const products = await getProducts();

  // 统计每个分类的产品数
  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    categoryCounts[p.category.slug] = (categoryCounts[p.category.slug] || 0) + 1;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">分类管理</h1>
      <CategoryManager categories={categories} categoryCounts={categoryCounts} />
    </div>
  );
}
