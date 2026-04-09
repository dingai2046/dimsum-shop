import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";

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

    const { items, address, deliveryType, deliveryFee, note, couponCode } = await request.json();

    if (!items?.length) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }

    if (!address?.name || !address?.phone) {
      return NextResponse.json({ error: "请填写联系信息" }, { status: 400 });
    }

    // 最低起送额校验
    const MIN_ORDER_AMOUNT = 2000; // $20
    const itemSubtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    if (deliveryType !== "pickup" && itemSubtotal < MIN_ORDER_AMOUNT) {
      return NextResponse.json(
        { error: `外送满$${MIN_ORDER_AMOUNT / 100}起送` },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const fee = deliveryFee || 0;

    // 优惠券验证和折扣计算
    let discount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isValid =
          (!coupon.startDate || now >= coupon.startDate) &&
          (!coupon.endDate || now <= coupon.endDate) &&
          (coupon.totalLimit === 0 || coupon.usedCount < coupon.totalLimit) &&
          subtotal >= coupon.minOrder;

        if (isValid) {
          const userUseCount = await prisma.couponUse.count({
            where: { couponId: coupon.id, userId: session.user.id },
          });

          if (userUseCount < coupon.perUserLimit) {
            let newUserOk = true;
            if (coupon.isNewUserOnly) {
              const orderCount = await prisma.order.count({
                where: { userId: session.user.id },
              });
              newUserOk = orderCount === 0;
            }

            if (newUserOk) {
              couponId = coupon.id;
              switch (coupon.type) {
                case "FIXED":
                  discount = coupon.value;
                  break;
                case "PERCENT":
                  discount = Math.round(subtotal * coupon.value / 100);
                  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                    discount = coupon.maxDiscount;
                  }
                  break;
                case "FREE_DELIVERY":
                  discount = fee;
                  break;
              }
              if (discount > subtotal + fee) {
                discount = subtotal + fee;
              }
            }
          }
        }
      }
    }

    const totalAmount = subtotal + fee - discount;

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

    // 记录优惠券使用
    if (couponId && discount > 0) {
      await prisma.couponUse.create({
        data: {
          couponId,
          userId: session.user.id,
          orderId: order.id,
          discount,
        },
      });
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 扣减库存
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
      });
    }

    // 发送订单确认邮件（不阻塞主流程）
    try {
      const userEmail = session.user.email;
      if (userEmail) {
        const emailItems = items.map((item: { name: string; quantity: number; price: number }) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }));
        sendOrderConfirmation(userEmail, orderNo, totalAmount, emailItems);
      }
    } catch (emailError) {
      console.error("发送订单确认邮件失败:", emailError);
    }

    return NextResponse.json({ order, discount }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("创建订单失败:", message, error);
    return NextResponse.json({ error: "创建订单失败", detail: message }, { status: 500 });
  }
}
