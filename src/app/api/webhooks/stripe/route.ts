import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "缺少签名" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook 签名验证失败:", error);
    return NextResponse.json({ error: "签名无效" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderNo = paymentIntent.metadata.orderNo;
      console.log(`支付成功: 订单 ${orderNo}, PaymentIntent ${paymentIntent.id}`);

      if (orderNo) {
        // 更新订单状态为 PAID
        const order = await prisma.order.update({
          where: { orderNo },
          data: { status: "PAID", paymentId: paymentIntent.id },
        });

        // 记录积分（每消费 1 元获 1 积分）
        const earnedPoints = Math.floor(order.subtotal / 100);
        if (earnedPoints > 0) {
          await prisma.pointsRecord.create({
            data: {
              userId: order.userId,
              orderId: order.id,
              points: earnedPoints,
              type: "EARN",
              description: `订单 ${orderNo} 消费获得积分`,
            },
          });
          await prisma.user.update({
            where: { id: order.userId },
            data: { points: { increment: earnedPoints } },
          });
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderNo = paymentIntent.metadata.orderNo;
      console.error(`支付失败: 订单 ${orderNo}, 原因: ${paymentIntent.last_payment_error?.message}`);

      if (orderNo) {
        await prisma.order.update({
          where: { orderNo },
          data: { status: "CANCELLED" },
        });
      }
      break;
    }

    default:
      console.log(`未处理的事件类型: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
