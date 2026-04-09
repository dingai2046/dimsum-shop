"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CategoryTabs } from "./category-tabs";
import { MenuProductCard } from "./menu-product-card";

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

interface MenuSectionProps {
  categories: CategoryWithProducts[];
  onProductClick?: (product: Product) => void;
}

export function MenuSection({ categories, onProductClick }: MenuSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isScrollingTo = useRef(false);
  const t = useTranslations("menu");

  // IntersectionObserver 自动高亮
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((element, categoryId) => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (isScrollingTo.current) return;
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              setActiveCategoryId(categoryId);
            }
          });
        },
        { threshold: [0.3], rootMargin: "-120px 0px -50% 0px" }
      );
      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [categories]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    const element = sectionRefs.current.get(categoryId);
    if (element) {
      isScrollingTo.current = true;
      const headerOffset = 120; // sticky header + tabs height
      const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
      setTimeout(() => { isScrollingTo.current = false; }, 800);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 搜索过滤
  const filteredCategories = searchQuery
    ? categories
        .map((cat) => ({
          ...cat,
          products: cat.products.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.products.length > 0)
    : categories;

  return (
    <div>
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onCategoryClick={handleCategoryClick}
        onSearch={handleSearch}
      />

      <div className="mx-auto max-w-7xl px-4">
        {filteredCategories.map((cat) => (
          <section
            key={cat.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(cat.id, el);
            }}
            className="pt-6 pb-3"
          >
            <h2 className="mb-2 flex items-center gap-1.5 text-lg font-bold">
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
              <span className="text-xs font-normal text-muted-foreground">
                ({cat.products.length})
              </span>
            </h2>

            <div className="divide-y divide-border/50">
              {cat.products.map((product) => (
                <MenuProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  wholesalePrice={product.wholesalePrice}
                  image={product.image || "/images/products/xiajiao.jpg"}
                  soldCount={product.soldCount}
                  tags={product.tags}
                  servingSize={product.servingSize}
                  onDetailClick={() => onProductClick?.(product)}
                />
              ))}
            </div>
          </section>
        ))}

        {filteredCategories.length === 0 && searchQuery && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">{t("noSearchResults", { query: searchQuery })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
