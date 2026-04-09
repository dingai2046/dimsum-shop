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

    const { items, address, deliveryType, deliveryFee, note } = await request.json();

    if (!items?.length) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }

    if (!address?.name || !address?.phone) {
      return NextResponse.json({ error: "请填写联系信息" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const fee = deliveryFee || 0;
    const totalAmount = subtotal + fee;

    const orderNo = generateOrderNo();

    const order = await prisma.order.create({
      data: {
        orderNo,
        userId: session.user.id,
        deliveryType: deliveryType === "pickup" ? "PICKUP" : "DELIVERY",
        deliveryFee: fee,
        subtotal,
        totalAmount,
        status: "PENDING",
        note: note || null,
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
    const message = error instanceof Error ? error.message : String(error);
    console.error("创建订单失败:", message, error);
    return NextResponse.json({ error: "创建订单失败", detail: message }, { status: 500 });
  }
}
