import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: body.price,
        originalPrice: body.originalPrice || null,
        image: body.image || null,
        images: body.image ? [body.image] : [],
        categoryId: body.categoryId,
        stock: body.stock ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("创建产品失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
