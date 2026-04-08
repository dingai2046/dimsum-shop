import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateOrderNo() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DF${dateStr}${random}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { items, address } = await request.json();

    if (!items?.length) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }

    if (!address?.name || !address?.phone || !address?.detail) {
      return NextResponse.json({ error: "请填写完整的收货信息" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const orderNo = generateOrderNo();

    const order = await prisma.order.create({
      data: {
        orderNo,
        userId: session.user.id,
        totalAmount,
        status: "PENDING",
        addressSnapshot: address,
        items: {
          create: items.map(
            (item: { productId: string; name: string; price: number; quantity: number; image: string }) => ({
              productId: item.productId,
              productSnapshot: {
                name: item.name,
                price: item.price,
                image: item.image,
              },
              quantity: item.quantity,
              price: item.price,
            })
          ),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
