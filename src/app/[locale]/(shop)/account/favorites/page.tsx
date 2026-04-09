import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FavoritesContent } from "@/components/shop/favorites-content";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/favorites");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          image: true,
          soldCount: true,
          isActive: true,
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedFavorites = favorites.map((f) => ({
    id: f.id,
    productId: f.product.id,
    name: f.product.name,
    slug: f.product.slug,
    price: f.product.price,
    originalPrice: f.product.originalPrice,
    image: f.product.image,
    soldCount: f.product.soldCount,
    isActive: f.product.isActive,
    categoryName: f.product.category.name,
  }));

  return <FavoritesContent initialFavorites={formattedFavorites} />;
}
