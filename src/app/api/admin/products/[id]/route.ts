import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
        image: body.image || null,
        images: body.image ? [body.image] : [],
        categoryId: body.categoryId,
        stock: body.stock ?? 0,
        isActive: body.isActive ?? true,
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
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除产品失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
