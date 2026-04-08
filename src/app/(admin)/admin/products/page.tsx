import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getProducts } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils/format";

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">产品管理</h1>
          <p className="text-sm text-muted-foreground">{products.length} 款产品</p>
        </div>
        <Link
          href="/admin/products/new"
          className={buttonVariants({ className: "gap-1.5" })}
        >
          <Plus className="h-4 w-4" />
          新增产品
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">产品</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">分类</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">价格</th>
              <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">库存</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">状态</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={product.image || "/images/products/xiajiao.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <span className="font-medium truncate max-w-[120px] md:max-w-none">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {product.category.name}
                </td>
                <td className="px-4 py-3 font-medium text-primary">
                  {formatPrice(product.price)}
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {product.stock}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.isActive
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {product.isActive ? "上架" : "下架"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
