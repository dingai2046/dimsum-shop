"use client";

import { useState } from "react";
import { StoreStatusBar } from "./store-status-bar";
import { DeliveryToggle } from "./delivery-toggle";
import { HotPicks } from "./hot-picks";
import { MenuSection } from "./menu-section";
import { CartBar } from "./cart-bar";
import { CartSheet } from "./cart-sheet";
import { ProductDetailSheet } from "./product-detail-sheet";

interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  wholesalePrice?: number | null;
  image: string | null;
  soldCount: number;
  tags: string[];
  servingSize?: string | null;
  category: { id: string; slug: string; name: string };
}

interface CategoryWithProducts {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
  products: Product[];
}

interface HotProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  soldCount: number;
}

interface MenuPageProps {
  categories: CategoryWithProducts[];
  hotProducts: HotProduct[];
}

export function MenuPage({ categories, hotProducts }: MenuPageProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailOpen(true);
  };

  return (
    <div className="pb-24">
      {/* 商店状态 */}
      <StoreStatusBar />

      {/* 配送/自取切换 */}
      <div className="mx-auto max-w-7xl px-4 py-3">
        <DeliveryToggle />
      </div>

      {/* 热销推荐横滑 */}
      <HotPicks products={hotProducts} />

      {/* 分类菜单 */}
      <MenuSection
        categories={categories}
        onProductClick={handleProductClick}
      />

      {/* Sticky 购物车栏 */}
      <CartBar onCartClick={() => setCartOpen(true)} />

      {/* 购物车详情 Sheet */}
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* 产品详情 Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
