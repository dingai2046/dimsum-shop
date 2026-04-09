import type { Metadata } from "next";
import { getMenuData, getFeaturedProducts } from "@/lib/api/products";
import { MenuPage } from "@/components/shop/menu-page";

export const metadata: Metadata = {
  title: "東方點心 Dong Fang Dim Sim | 在线点餐",
  description: "正宗手工点心，在线下单，外送配送或门店自取。水饺、云吞、烧卖、小笼包，新鲜手工现做。",
};

export default async function HomePage() {
  const [categories, hotProducts] = await Promise.all([
    getMenuData(),
    getFeaturedProducts(8),
  ]);

  return (
    <MenuPage
      categories={categories}
      hotProducts={hotProducts}
    />
  );
}
