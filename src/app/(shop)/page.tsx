import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CategoryGrid } from "@/components/shop/category-grid";
import { ProductCard } from "@/components/shop/product-card";
import { getFeaturedProducts } from "@/lib/api/products";
import { getSiteSettings } from "@/lib/api/site-settings";

export default async function HomePage() {
  const [featuredProducts, settings] = await Promise.all([
    getFeaturedProducts(4),
    getSiteSettings(),
  ]);
  const { hero, brandPromise } = settings;

  return (
    <div>
      {/* Hero 区域 */}
      <section className="relative h-[70vh] min-h-[480px] max-h-[720px] overflow-hidden">
        <Image
          src={hero.image}
          alt="热气腾腾的点心"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-12 md:items-center md:pb-0">
          <div className="max-w-md">
            <p className="mb-2 text-sm font-medium tracking-widest text-white/70 uppercase">
              {hero.tagline}
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              {hero.title}
              <br />
              {hero.subtitle}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
              {hero.description}
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href={hero.ctaPrimary.href}
                className={buttonVariants({
                  size: "lg",
                  className: "h-12 px-8 text-base rounded-full shadow-lg shadow-primary/30",
                })}
              >
                {hero.ctaPrimary.text}
              </Link>
              <Link
                href={hero.ctaSecondary.href}
                className={buttonVariants({
                  size: "lg",
                  variant: "secondary",
                  className: "h-12 px-8 text-base rounded-full bg-white/20 text-white border-0 hover:bg-white/30",
                })}
              >
                {hero.ctaSecondary.text}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 分类导航 */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <h2 className="mb-6 text-xl font-bold md:text-2xl">分类浏览</h2>
        <CategoryGrid />
      </section>

      {/* 精选推荐 */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold md:text-2xl">精选推荐</h2>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image || "/images/products/xiajiao.jpg"}
                category={product.category.name}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 品牌承诺 */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-center">
          <div>
            <p className="text-sm font-medium tracking-widest text-primary uppercase">
              我们的承诺
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
              {brandPromise.title}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {brandPromise.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {brandPromise.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-secondary/50 p-5">
                <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
