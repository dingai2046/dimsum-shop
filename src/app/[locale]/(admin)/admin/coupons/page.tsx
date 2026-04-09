import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/coupon-manager";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">优惠券管理</h1>
      <CouponManager coupons={JSON.parse(JSON.stringify(coupons))} />
    </div>
  );
}
