import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/coupons/[id] - 获取优惠券信息
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const coupon = await prisma.coupon.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      description: true,
      endDate: true,
    },
  });

  if (!coupon) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(coupon);
}
