"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  name: string;
  icon?: string | null;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onCategoryClick: (categoryId: string) => void;
  onSearch?: (query: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  onCategoryClick,
  onSearch,
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚动激活的 tab 到可视区域
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeTab = container.querySelector(`[data-category-id="${activeCategoryId}"]`) as HTMLElement;
    if (!activeTab) return;
    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
      activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategoryId]);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  return (
    <div className="sticky top-14 z-40 border-b border-border/50 bg-background/95 backdrop-blur-md md:top-16">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4">
        {/* 搜索 */}
        {searchOpen ? (
          <div className="flex flex-1 items-center gap-2 py-2 animate-fade-up">
            <div className="flex flex-1 items-center rounded-full bg-muted px-3 py-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索菜品..."
                className="ml-2 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
              {searchQuery && (
                <button onClick={() => handleSearch("")} className="text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => { setSearchOpen(false); handleSearch(""); }}
              className="shrink-0 text-xs text-primary font-medium"
            >
              取消
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setSearchOpen(true)}
              className="shrink-0 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* 分类标签横向滚动 */}
            <div
              ref={scrollRef}
              className="flex flex-1 gap-1 overflow-x-auto py-2.5 scrollbar-hide"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  data-category-id={cat.id}
                  onClick={() => onCategoryClick(cat.id)}
                  className={cn(
                    "relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                    activeCategoryId === cat.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {cat.icon && <span className="mr-0.5">{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
