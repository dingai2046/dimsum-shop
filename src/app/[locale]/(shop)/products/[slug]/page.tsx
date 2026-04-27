import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils/format";
import { ProductCard } from "@/components/shop/product-card";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dongfangdimsim.com.au";

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "产品未找到" };
  return {
    title: product.name,
    description: product.description?.slice(0, 150),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 150) || undefined,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(slug, 4);

  return <ProductContent product={product} relatedProducts={relatedProducts} />;
}

function ProductContent({
  product,
  relatedProducts,
}: {
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
  relatedProducts: Awaited<ReturnType<typeof getRelatedProducts>>;
}) {
  const t = useTranslations("product");

  const hasDiscount =
    product.originalPrice !== null && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image?.startsWith("http") ? product.image : product.image ? `${BASE_URL}${product.image}` : undefined,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "AUD",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    category: product.category.name,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* 面包屑导航 */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground transition-colors">
          {t("allProducts")}
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-foreground transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* 产品主体 */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* 左侧：产品图片 */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <Image
            src={product.image || "/images/products/xiajiao-2.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          {hasDiscount && (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground shadow">
              {t("save", { percent: discountPercent })}
            </span>
          )}
        </div>

        {/* 右侧：产品信息 */}
        <div className="flex flex-col">
          <Link
            href={`/categories/${product.category.slug}`}
            className="mb-2 w-fit text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>

          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

          {/* 价格 */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground/70 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>

          {/* 描述 */}
          <p className="mt-6 leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* 分割线 */}
          <div className="my-6 border-t border-border" />

          {/* 加入购物车 */}
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            productName={product.name}
            price={product.price}
            image={product.image || "/images/products/xiajiao-2.jpg"}
            stock={product.stock}
          />

          {/* 服务保障 */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-sm font-medium">{t("coldChain")}</p>
              <p className="text-[11px] text-muted-foreground">{t("freshKeeping")}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-sm font-medium">{t("handmade")}</p>
              <p className="text-[11px] text-muted-foreground">{t("traditional")}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-sm font-medium">{t("refund")}</p>
              <p className="text-[11px] text-muted-foreground">{t("quality")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 相关推荐 */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">{t("relatedProducts")}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                originalPrice={p.originalPrice}
                image={p.image || "/images/products/xiajiao-2.jpg"}
                category={p.category.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
