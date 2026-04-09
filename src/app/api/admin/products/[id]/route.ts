import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        price: body.price,
        originalPrice: body.originalPrice || null,
        wholesalePrice: body.wholesalePrice || null,
        image: body.image || null,
        images: body.image ? [body.image] : [],
        categoryId: body.categoryId,
        stock: body.stock ?? 0,
        isActive: body.isActive ?? true,
        tags: body.tags ?? [],
        servingSize: body.servingSize || null,
        soldCount: body.soldCount ?? 0,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error("更新产品失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除产品失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
