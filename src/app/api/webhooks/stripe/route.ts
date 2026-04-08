import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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

  // 处理支付事件
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderNo = paymentIntent.metadata.orderNo;
      console.log(`支付成功: 订单 ${orderNo}, PaymentIntent ${paymentIntent.id}`);

      // TODO: 更新订单状态为 PAID
      // await prisma.order.update({
      //   where: { orderNo },
      //   data: { status: "PAID", paymentId: paymentIntent.id },
      // });
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderNo = paymentIntent.metadata.orderNo;
      console.log(`支付失败: 订单 ${orderNo}`);
      // TODO: 记录支付失败日志
      break;
    }

    default:
      console.log(`未处理的事件类型: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
