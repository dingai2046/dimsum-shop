import { prisma } from "@/lib/prisma";
import { AdminReviewManager } from "@/components/admin/review-manager";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedReviews = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    content: r.content,
    images: r.images,
    isVisible: r.isVisible,
    createdAt: r.createdAt.toISOString(),
    user: { name: r.user.name, email: r.user.email },
    product: { name: r.product.name, image: r.product.image },
  }));

  return (
    <div>
      <AdminReviewManager initialReviews={formattedReviews} />
    </div>
  );
}
